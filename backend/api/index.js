import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "../connectDB.js";
import userRoutes from "../routes/users.routes.js";

// Load env
dotenv.config();

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

export default app;
