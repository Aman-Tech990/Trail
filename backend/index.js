import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./connectDB.js";

// Load environment variables
if (process.env.NODE_ENV !== "production") {
    dotenv.config({});
}

// Initialize App
const app = express();

// Environment PORT
const PORT = process.env.PORT || 3005;

// Database connection
connectDB();

// CORS Middleware
app.use(cors({
    origin: "https://trail-vei3.vercel.app/",
    credentials: true,
}));

// Default Middlewares
app.use(express.json());
app.use(cookieParser());

// check
app.get("/", (req, res) => {
    res.json("HI from backend");
});

// APIs routes

// App Entry
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
