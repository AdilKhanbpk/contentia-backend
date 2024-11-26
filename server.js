import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from config.env file
dotenv.config({ path: "./.env" });

import app from "./app.js";
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.DATABASE);
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
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}/`);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION! 💥 Shutting down...");
      console.log(err);
      console.error(err.name, err.message);
      server.close(() => {
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
