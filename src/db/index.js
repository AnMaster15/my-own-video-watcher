import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";
// import express from "express"

const connectDB=async ()=>{
    try {
        const connectionIntence =await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("Database connected successfully");
        console.log(`DB hosted at : ${connectionIntence.connection.host}`);
    } catch (error) {
        console.log("Error connecting to database", error);
        process.exit(1)
    }
}

export default connectDB