import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js'




// login user 

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.json({ success: false, message: "User not found" });

        if (!user.isVerified)
            return res.json({ success: false, message: "Please verify your email via OTP." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.json({ success: false, message: "Invalid credentials" });

        // 🔥 Generate Token
        const token = jwt.sign(
            { id: user._id, email: user.email }, // payload
            process.env.JWT_SECRET,             // secret key
            { expiresIn: "7d" }                 // expiry
        );


        // 🔥 CREATE COOKIE
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",          // HTTPS only in production
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 24 * 60 * 60 * 1000   // 24 hours
        });


        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};
