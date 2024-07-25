import dotenv from "dotenv"
import express from "express"
import connectDB from "./db/index.js";

dotenv.config(
    {
        path: "./.env"
    }
)

connectDB()

















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