import dotenv from "dotenv"
import express from "express"
import connectDB from "./db/index.js";

dotenv.config(
    {
        path: "./.env"
    }
)

connectDB()
    .then(() => {
        app.on("error", (err) => {
            console.log("error", err);
            throw err
        })
        
        app.listen(process.env.PORT || 8000, () => {
            console.log(`server is running at port : ${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.log("mongo connection lost", err)
    })















// const app = express();

// ; (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         console.log("Database connected successfully");
//         app.on("error", (err) => {
//             console.log("error", err);
//             throw err
//         })

//         app.listen(process.env.PORT, () => {
//             console.log(`Server started at port ${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.log("Error connecting to database", error);
//         throw error
//     }
// })()