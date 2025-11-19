import express from "express";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

// CONNECT TO DATABASE
await connectDB();

// TEST ROUTE
app.get("/", (req, res) => {
    res.send("Server is Running!");
});

// API ROUTES
app.use("/api/user", userRouter);

// START SERVER
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
