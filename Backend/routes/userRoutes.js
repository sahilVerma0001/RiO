import express from 'express';
import {
    loginUser,
    registerUser,
    verifyOtp,
    forgotPassword,
    resetPassword,
    logoutUser
} from '../controllers/userControllers.js';

const userRouter = express.Router();

// AUTH ROUTES
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/verify-otp', verifyOtp);

// PASSWORD RESET ROUTES
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);

// LOGOUT
userRouter.get('/logout', logoutUser);

export default userRouter;
