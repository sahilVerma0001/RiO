import express from "express";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

// connect to Database
await connectDB();


app.get('/', (req, res) => {
    res.send("Server is Running!");
})

//apies
app.use('/api/user', userRouter);



app.listen(PORT, () => {
    console.log(`Server is listening on port Number ${PORT}`);
})