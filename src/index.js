import dotenv from "dotenv";
import { app } from "./app.js";  // Import the configured Express app
import connectDB from "./db/index.js";  // Import your DB connection logic

dotenv.config({
    path: "./.env"
});

connectDB()
    .then(() => {
        app.on("error", (err) => {
            console.log("Error occurred:", err);
            throw err;
        });

        const PORT = process.env.PORT || 8000;
        app.listen(PORT, () => {
            console.log(`Server is running at port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB connection failed:", err);
    });

    