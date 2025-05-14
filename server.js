import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from config.env file
dotenv.config();

import { server } from "./app.js";

process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.error(err.name, err);
    process.exit(1);
});

const connectDB = async () => {
    try {
        // const connection = await mongoose.connect(process.env.DATABASE);
        const connection = await mongoose.connect("mongodb+srv://saudkhanbpk:saudkhanbpk3939@cluster0.t6wy40b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        console.log(
            `Database connection successful with ==> '${connection.connection.name}'`
        );
    } catch (err) {
        console.error("DB connection error:", err);
        process.exit(1);
    }
};

const startServer = async () => {
    try {
        const PORT = process.env.PORT || 8000;
        const serverListener = server.listen(PORT, () => {
            // Check if running on Render
            if (process.env.RENDER) {
                console.log(`Server running on Render deployment`);
            } else {
                console.log(`Server running on ${PORT}`);
            }
        });

        // Handle unhandled promise rejections
        process.on("unhandledRejection", (err) => {
            console.error("UNHANDLED REJECTION! 💥 Shutting down...");
            console.log(err);
            console.error(err.name, err.message);
            serverListener.close(() => {
                process.exit(1);
            });
        });
    } catch (err) {
        console.error("Error starting the server:", err);
        process.exit(1);
    }
};

// Execute database connection and server start
const initializeApp = async () => {
    await connectDB();
    await startServer();
};

initializeApp();
