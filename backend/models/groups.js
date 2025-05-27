import mongoose from "mongoose";

import dotenv from 'dotenv';
dotenv.config();
const MONGO_URL=process.env.MONGO_URL;
mongoose.connect(MONGO_URL);

const memberSchema = new mongoose.Schema({
  name: String,
  email: String,
  _id: false,
});

const expenseSchema = new mongoose.Schema({
    amount:Number,
    description:String,
    paidBy:{
      name:String,
      mail:String
    },
    splitType: { type: String, enum: ["EQUAL", "CUSTOM"], default: "EQUAL" },
    splits: [{
      name:String,
      mail:String,
      amount: Number // What each user owes in this expense
    }],
    date: {
        type: Date,
        default: Date.now
    }
})
const GroupsSchema = new mongoose.Schema({
    name:String,
    members:[memberSchema],
    leader:String,
    expenses:[expenseSchema]
})
const Groups = mongoose.model('Group',GroupsSchema);
export default Groups