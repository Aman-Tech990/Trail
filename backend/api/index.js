import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "../connectDB.js";
import userRoutes from "../routes/users.routes.js";

// Load env FIRST
dotenv.config();

// DEBUG: Check if env variables are loaded
console.log('=== ENV CHECK ===');
console.log('OPENCAGE_API_KEY:', process.env.OPENCAGE_API_KEY ? 'EXISTS' : 'MISSING');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'EXISTS' : 'MISSING');
console.log('================');

// Create Express app
const app = express();

// Connect DB (only once)
connectDB();

// Middlewares
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://trail-chi-ten.vercel.app"
    ],
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Hi from backend!"
    });
});

app.use('/api/users', userRoutes);

app.get("/hello", (req, res) => {
    res.json({
        success: true,
        message: "Hello bhaiii sun jara!"
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

export default app;