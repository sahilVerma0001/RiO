import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer';
import User from '../models/User.js'



// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail service
    auth: {
        user: process.env.EMAIL_USER, // Replace with your Gmail
        pass: process.env.EMAIL_PASS, // Replace with your App Password
    },
});

// Optional: Only verify in development
if (process.env.NODE_ENV === "development") {
    transporter.verify((error) => {
        if (error) console.log("Nodemailer Error:", error);
        else console.log("Nodemailer Ready");
    });
}



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

// register user

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password || password.length < 8) {
            return res.json({ success: false, message: "Fill all fields properly" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP (6-digit)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save user as unverified
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpires: Date.now() + 10 * 60 * 1000, // 10 min
            isVerified: false,
        });

        // ✅ Send OTP email (async — no need to wait)
        transporter.sendMail({
            from: `"RiO the leading platform" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify your email - RiO",
            html: `
        <h2>Hello ${name},</h2>
        <p>Welcome to RiO! Please verify your email to secure your account.</p>
        <h1 style="letter-spacing:4px;">${otp}</h1>
        <p>This OTP will expire in <b>10 minutes</b>.</p>
      `,
        }).catch(err => console.error("OTP email error:", err));

        res.json({
            success: true,
            message: "Registered successfully! OTP sent to your email.",
            user: {
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
            },
        });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: "Something went wrong" });
    }
};

// POST /api/user/verify-otp
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.json({ success: false, message: "Email and OTP are required" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.json({ success: false, message: "User not found" });

        if (user.isVerified) {
            return res.json({ success: true, message: "User already verified" });
        }

        // Check OTP validity
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.json({ success: false, message: "Invalid or expired OTP" });
        }

        // Mark as verified
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // 🔥 Generate Token
        const token = jwt.sign(
            { id: user._id, email: user.email }, // payload
            process.env.JWT_SECRET,             // secret key
            { expiresIn: "7d" }                 // expiry
        );


        // ✅ Immediately log in user (generate token)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",          // HTTPS only in production
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 24 * 60 * 60 * 1000   // 24 hours
        });


        res.json({
            success: true,
            token,
            message: "Email verified successfully!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: "Error verifying OTP" });
    }
};

// LOGOUT USER
export const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax"
        });

        res.json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: "Logout failed" });
    }
};

// FORGOT PASSWORD (Send OTP)
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) return res.json({ success: false, message: "Email is required" });

        const user = await User.findOne({ email });
        if (!user) return res.json({ success: false, message: "User not found" });

        // Generate reset OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.forgotOtp = otp;
        user.forgotOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send email
        await transporter.sendMail({
            from: `"RiO Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Password Reset OTP - RiO",
            html: `
                <h2>Your Password Reset OTP</h2>
                <h1>${otp}</h1>
                <p>This OTP is valid for 10 minutes.</p>
            `
        });

        res.json({
            success: true,
            message: "OTP sent to email for password reset",
        });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: "Something went wrong" });
    }
};

// RESET PASSWORD (Verify OTP + set new password + auto login)
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword)
            return res.json({ success: false, message: "All fields required" });

        if (newPassword.length < 8)
            return res.json({ success: false, message: "Password must be 8+ characters" });

        const user = await User.findOne({ email });
        if (!user) return res.json({ success: false, message: "User not found" });

        // Check OTP
        if (user.forgotOtp !== otp || user.forgotOtpExpires < Date.now()) {
            return res.json({ success: false, message: "Invalid or expired OTP" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password + clear OTP
        user.password = hashedPassword;
        user.forgotOtp = undefined;
        user.forgotOtpExpires = undefined;

        await user.save();

        // 🔥 Auto Login - Create JWT Token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 🔥 Send Cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 24 * 60 * 60 * 1000  // 24 hours
        });

        res.json({
            success: true,
            message: "Password reset successful! Logged in automatically.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: "Error resetting password" });
    }
};
