import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
const MONGO_URL=process.env.MONGO_URL;
mongoose.connect(MONGO_URL);

const cacheSchema = new mongoose.Schema({
    name:String,
    mail:String,
    cache:Object
})

const Cache = mongoose.model('cache',cacheSchema);
export default Cache;