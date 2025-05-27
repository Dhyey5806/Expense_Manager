import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import analyzeSpendingWithDeepSeek from './services/aiService.js';
import { ObjectId } from 'mongoose';

import { Server } from 'socket.io' 
import {createServer} from 'http'

import User from './models/users.js';
import Groups from './models/groups.js';
import Cache from './models/cache.js';

import calc from './utils/calculateSettlement.js';

const app = express();
app.use(cookieParser());
const port=process.env.PORT;

const server = createServer(app);
const io = new Server(server,{
    cors:{
        origin:'http://localhost:8080',
        methods:["GET","POST"],
        credentials:true,
    }   
});

app.use(cors({
  origin: 'http://localhost:8080',  
  credentials: true,
})); 
app.use(express.json())


io.on('connection',(socket) => {
  console.log("User connected to backend socket",socket.id);

  socket.on('group-join',async (data) => {
    console.log("Here in backend to connect the socket in group:-",data.id);
    
    socket.groupId = data.id;
    socket.email = data.mail;

    socket.join(data.id);

    console.log("User Joined the Room:-",data.id);

    const sockets = await io.in(data.id).fetchSockets();
    const onlineEmails = sockets.map(s => s.email).filter(Boolean);

    io.to(data.id).emit('online-users', onlineEmails);
  })

  socket.on('disconnect', async () => {
      const groupId = socket.groupId;
      console.log("GroupId is:-",groupId);
      console.log('User disconnected:', socket.email);

      if (groupId) {
        const sockets = await io.in(groupId).fetchSockets(); // excludes disconnected one
        const onlineEmails = sockets.map(s => s.email).filter(Boolean);

        console.log('Updated online users after disconnect:', onlineEmails);
        io.to(groupId).emit('online-users', onlineEmails); 
      }
  });

  socket.on('view-expense',(data) =>{
    console.log("Get the req on server for viewing data now broadcasting it..");
    socket.to(data.id).emit('new-expense-came',data);
  })

  socket.on('delete-expense',(data) => {
    console.log('delete-expense recieved now emiting :- delete-expense-came')
    socket.to(data.id).emit('delete-expense-came',data);
  })
})

async function userdata(req){
   const token = req.cookies.token;
   let resp;
  if (!token) {
    resp="token missing";
  }
  else{
    try {
      console.log("While validing token...")
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      resp=decoded;
    } catch (err) {
      resp='invalid token';
    }
  }
  return resp;
}
app.post('/login',async (req,res) => {
    try {
    const { mail, password } = req.body;

    const user = await User.findOne({ mail });
    if (!user) return res.send('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send('Invalid credentials');
    
    console.log(user);

    const token = jwt.sign({mail:mail},process.env.JWT_SECRET,{ expiresIn: '3h' })
    console.log(token);
    if (typeof token !== 'string') {
        console.log("No String hehe");
    }
    res.cookie('token', token, {
        httpOnly: true,
        maxAge: 3 * 60 * 60 * 1000,
        sameSite: 'lax',
        secure: false,
    });
    res.send('Login successful');
    
  } catch (err) {
    console.error(err);
    res.send('Server error');
  }
})

app.post('/signup',async (req,res) => {
    try {
    const { firstname, lastname, mail, password } = req.body;

    const existingUser = await User.findOne({ mail });
    if (existingUser) return res.send('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstname,
      lastname,
      mail,
      password: hashedPassword,
      expense: [],
      friends: []
    });

    await newUser.save();
    res.send('User Created Login Again');

  } catch (err) {
    console.error(err);
    res.send('Server error');
  }
})

app.get('/verify', (req, res) => {
  const token = req.cookies.token;
  console.log("into backend verify")
  if (!token) {
    console.log("No token");
    return res.status(401).json({ verified: false, message: 'Token missing' });
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ verified: true, user: data });
  } catch (error) {
    return res.status(401).json({ verified: false, message: 'Invalid or expired token' });
  }
});

app.post('/add',async (req,res) =>{
  console.log("Backend Add req");
  const {mail}=await userdata(req);
  console.log(mail);
  const newExpense = req.body
  if(!mail){
    console.log("token expired");
    return res.status(401).json({ message: "Unauthorized" });
  }
  else{
    try{
      const updatedUser = await User.findOneAndUpdate(
        { mail },
        { $push: { expense: newExpense } },
        { new: true } 
      );
      console.log("Expense added for user:", updatedUser.firstname);
      res.status(200).json({ message: "Expense added Succesfully", user: updatedUser });
    }catch(err){
      console.error("Error adding expense:", error);
      res.status(500).json({ message: "Internal Server Error try again" });
    }
  }
})

app.get('/view',async (req,res) => {
  console.log("Expense View karne Backend Aayen hain babua...");
  const {mail}=await userdata(req);
  console.log(mail);
  if(!mail){
    console.log("token expired");
    return res.status(401).json({ message: "Unauthorized" });
  }
  try{
    const udata = await User.findOne({mail:mail});
    console.log("User Exp:-",udata.expense);
    res.status(200).json({ message: "Expense Feteched", expense:udata.expense , firstname:udata.firstname , user:udata});
  }catch(err){
    console.error("Error adding expense:", err);
    res.status(500).json({ message: "Internal Server Error try again" });
  }
})

app.put('/update/:id',async (req,res) => {
  console.log("Expense update karne Backend Aayen hain babua...");
  const {mail}=await userdata(req);
  console.log(mail);

  const { id } = req.params;
  const { category, amount, description, date } = req.body;

  if(!mail){
    console.log("token expired");
    return res.status(401).json({ message: "Unauthorized" });
  }
  else{
    try{
      const updated = await User.findOneAndUpdate(
      { mail: mail, "expense._id": id}, // Find user with matching email and specific expense
      {
        $set: {
          "expense.$.category": category,
          "expense.$.amount": amount,
          "expense.$.description": description,
          "expense.$.date": date
        }
      },
      { new: true } 
    );
      if (!updated) {
        return res.status(404).json({ message: "Expense not found or user not found" });
      }
      console.log("Expense updated successfully");
      res.status(200).json({ message: "Expense updated successfully", updatedUser: updated });
    }catch(err){
      console.error("Update Error:", err);
      res.status(500).json({ message: "Failed to update expense Try again" });
    }
  }
})

app.delete('/delete/:id', async (req, res) => {
  console.log("Expense delete karne Backend Aayen hain babua...");

  const { mail } = await userdata(req);
  const { id: expenseId } = req.params;

  if (!mail) {
    console.log("Token expired or invalid.");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await User.findOne({ mail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.updateOne(
      { mail },
      { $pull: { expense: { _id: expenseId } } }
    );

    console.log("Expense deleted successfully.");
    res.status(200).json({ message: "Expense deleted successfully." });

  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get('/signout',(req,res) => {
  res.cookie('token','');
  res.status(200).json({ message: "Signout Succesfull" });
})

app.get('/user/find', async (req, res) => {
  console.log("Into backend for finding the user for friend");
  const { mail } = req.query;
  console.log("Searching for:", mail);

  if (!mail) {
    return res.status(400).json({ message: 'Email is required' });
  }
  try {
    const user = await User.findOne({ mail: mail }); 
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(decoded.mail == mail){
      return res.json({ message: "You cant write your own mail :)" });
    }
    if (!user) {
      console.log("Not found user boom boom")
      return res.status(404).json({ message: 'User not found' });
    }
    console.log("Found user",user);
    return res.json({user});

  } catch (err) {
    console.error("Error finding user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post('/add/friend',async (req,res) => {
  console.log("Here in backend to add frined");
  const {mail}=await userdata(req);
  console.log(mail);
  if(!mail){
    console.log("token expired");
    return res.status(401).json({ message: "Unauthorized" });
  }

   try {
    // Find the user by their email and add a new friend to their friends array
    const updatedUser = await User.findOneAndUpdate(
      { mail: mail }, // Find the user by their email
      { 
        $push: { 
          friends: {
            name: req.body.name,
            email: req.body.mail
          } 
        } 
      },
      { new: true } // Return the updated document
    );
    console.log(updatedUser)
    if (!updatedUser) {
      console.log("User Not added to frineds sad");
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "Friend added successfully", user: updatedUser });
  } catch (err) {
    console.error("Error adding friend:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
})

app.delete('/friend/delete/:mail',async(req,res) => {
  console.log("Here in backend to delete frined");
  const {mail} = await userdata(req);
  // console.log(mail);
  if(!mail){
    console.log("token expired");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const email = req.params.mail; 
  console.log("Email to delete:", email);

  try{
    const updatedUser = await User.findOneAndUpdate(
      { mail: mail }, // Find the user by their email
      { $pull: { friends: { email: email } } }, // Remove friend by their email
      { new: true } // Return the updated user
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Friend deleted successfully",
      updatedUser,
    });
  }catch(err){
    console.error("Error deleting friend:", err);
    res.status(500).json({ message: "Server error" });
  }
})

app.post('/groups/create',async (req,res) => {
  console.log("Here in backend to Create a Group");
  const {mail} = await userdata(req);
  // console.log(mail);
  if(!mail){
    console.log("token expired");
    return res.status(401).json({ message: "Unauthorized" });
  }
  try{ 
    const user = await User.findOne({mail});
    const {name,members} = req.body;
    console.log(members); 

    console.log(`${user.firstname.trim()} ${user.lastname.trim()}`);
    const updatedMembers = [
      ...members,
      {
        name: `${user.firstname.trim()} ${user.lastname.trim()}`,
        email: user.mail,
        _id: user._id
      }
    ];
    const insertedGroup =await Groups.create({
      name,
      members:updatedMembers,
      leader:mail,
      expense:[]
    })
    res.status(201).json({message:"Group Created",insertedGroup});
  }catch(err){
    console.error("Error creating group:", err);
  
    // Handle duplicate key errors (e.g., unique group names)
    if (err.code === 11000) {
      return res.status(409).json({ message: "Group name already exists" });
    }
    
    return res.status(500).json({ message: "Internal server error" });
  }
})

app.get('/view/group',async (req,res) => {
  console.log("Here in backend to Create a Group");
  const {mail} = await userdata(req);
  // console.log(mail);
  if(!mail){
    console.log("token expired");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try{
    const groups = await Groups.find({
      "members.email": mail
    });
    return res.status(200).json({ groups:groups , mail:mail});
  }catch(err){
    console.error("Error fetching groups:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
})

app.get('/group/:id',async (req,res) => {
  console.log("Here in backend to Authorize the person");
  const {mail} = await userdata(req);
  // console.log(mail);
  if(!mail){
    console.log("token expired");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try{
    const groupId = req.params.id;
    const group = await Groups.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found', authorized: false });
    }
    const isMember = group.members.some(member => member.email === mail);
    if (!isMember) {
      return res.status(403).json({ authorized: false, message: 'Not a group member' });
    }
    return res.status(200).json({ authorized: true });
  }catch(err){
    console.error("Error checking group membership:", err);
    return res.status(500).json({ authorized: false, message: 'Server error' });
  }
})

app.delete('/delete/group/:id',async (req,res) => {
  const {id} = req.params;
  console.log("Here in backend to Authorize the person");
  const {mail} = await userdata(req);
  // console.log(mail);
  if(!mail){
    console.log("token expired");
    return res.status(401).json({ message: "Unauthorized" });
  }
  try{
    await Groups.findByIdAndDelete(id);
    res.status(200).json({ message: 'Group and its related expenses deleted successfully.' });
  }catch(err){
    console.error('Error deleting group:', err);
    res.status(500).json({ message: 'Server error while deleting group.' });
  }
})

app.get('/group/find/:id',async (req,res) => {
  const {id} = req.params;
  console.log("Here in Backend to serve the group find req to see chat");
  const {mail} = await userdata(req);
  // console.log(mail);
  if(!mail){
    console.log("token expired");
    return res.status(401).json({ message: "Unauthorized" });
  }
  try{
    const fetechedGroup = await Groups.findById(id);
    console.log("Expenses in fetched group on refresh:", fetechedGroup.expenses);
    return res.status(200).json({message:"Group Found Successfully",fetechedGroup:fetechedGroup});
  }catch(err){
    console.error("Error Finding the group",err);
    return res.status(500).json({ message:'Internal server Error' });
  }
})

app.post('/group/addexpense',async(req,res) => {
  console.log("Here in Backend to add a group expense");
  const {mail} = await userdata(req);

  if(!mail){
    console.log("token expired");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try{
    const {expense,id} = req.body;
    const updatedGroup = await Groups.findByIdAndUpdate(
      id,
      { $push: { expenses: expense } },
      { new: true } // returns the updated document
    );
    if (!updatedGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    const savedExpense = updatedGroup.expenses[updatedGroup.expenses.length - 1];
    console.log("Here is saved Expense",savedExpense);
    res.status(200).json({
      message: "Expense added successfully",
      savedExpense,
    });
  }catch(err){
    console.error("Error adding expense:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
})

app.delete('/group/expense/delete',async (req,res) => {

  console.log("Here in Backend to delete a group expense");
  const {mail} = await userdata(req);

  if(!mail){
    console.log("token expired");
    return res.status(401).json({ message: "Unauthorized" });
  }
  try{
    const {exp_id,id} =req.body;
    if (!exp_id || !id) {
      return res.status(400).json({ message: 'Missing group ID or expense ID' });
    }

    console.log("Now i am going to try to delete the expense....");
    const group = await Groups.findById(id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    const index = group.expenses.findIndex(exp => exp._id.toString() === exp_id);
    if (index === -1) {
      return res.status(404).json({ message: 'Expense not found in group' });
    }
    group.expenses.splice(index, 1);
    await group.save();

    console.log("Looks like i have deleted group expense",group.expenses);
    res.status(200).json({ message: 'Expense deleted successfully', group: group });
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  } 
})

app.get('/results/:id',async(req,res) => {
  console.log("Here in backend to show results")
  const {id} = req.params;
  try{
    const fetechedGroup = await Groups.findById(id);
    const {settlements, userSpendings} = calc(fetechedGroup.expenses);
    res.status(200).json({message:"succesfully fetched the results",settlements,userSpendings});
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
})

app.get('/airesponse', async (req, res) => {
  console.log("Here in Backend to fetch two month expense response");

  const { mail } = await userdata(req);
  if (!mail) return res.status(401).json({ message: "Unauthorized" });

  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  try {
    const result = await User.aggregate([
      { $match: { mail } },
      {
        $project: {
          _id: 0,
          currentMonthExpenses: {
            $filter: {
              input: "$expense",
              as: "exp",
              cond: {
                $and: [
                  { $gte: ["$$exp.date", startOfCurrentMonth] },
                  { $lte: ["$$exp.date", endOfCurrentMonth] }
                ]
              }
            }
          },
          previousMonthExpenses: {
            $filter: {
              input: "$expense",
              as: "exp",
              cond: {
                $and: [
                  { $gte: ["$$exp.date", startOfPreviousMonth] },
                  { $lte: ["$$exp.date", endOfPreviousMonth] }
                ]
              }
            }
          }
        }
      }
    ]);

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "User not found or no expenses" });
    }

    const { currentMonthExpenses, previousMonthExpenses } = result[0];
    const totalEntries = currentMonthExpenses.length + previousMonthExpenses.length;

    if (totalEntries === 0 || totalEntries % 5 !== 0) {
      const cachresp = await Cache.findOne({ mail });
      return res.status(200).json({
        message: "Cached Response Fetched",
        cached:true,
        response: cachresp?.cache || {}
      });
    }

    // Get new AI response
    
    let response_json = await analyzeSpendingWithDeepSeek(currentMonthExpenses, previousMonthExpenses);
    response_json = response_json.replace(/^```json\s*|```$/g, '').trim();
    // Store/update cache in DB
    await Cache.findOneAndUpdate(
      { mail },
      { mail, cache: JSON.parse(response_json) },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "New AI Response", cached:false ,response: JSON.parse(response_json) });

  } catch (err) {
    console.error("Mongo aggregation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/usermail',async(req,res) => {
  console.log("Here in Backend to get a Usermail to connet the socket in mail");
  const {mail} = await userdata(req);

  if(!mail){
    console.log("token expired");
    return res.status(401).json({ message: "Unauthorized" });
  }
  return res.status(200).json({ message:"User is Online" , mail:mail });
})

server.listen(port,() => {
    console.log("Backend Started on 3000");
})