import mongoose from "mongoose";

import dotenv from 'dotenv';
dotenv.config();
const MONGO_URL=process.env.MONGO_URL;
mongoose.connect(MONGO_URL);

const expenseSchema = new mongoose.Schema({
  amount: Number,
  category: String,
  description: String,
  date: {
    type: Date,
    default: Date.now
  }
});

const friendSchema = new mongoose.Schema({
  name: String,
  email: String,
  _id:String
});

const userSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  mail: String,
  password: String,
  expense: [expenseSchema],
  friends: [friendSchema]  
});

const User = mongoose.model('User', userSchema);
export default User;
