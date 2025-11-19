import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        // 1️⃣ Read token from cookies
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, token missing"
            });
        }

        // 2️⃣ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        // 3️⃣ Attach logged-in user to req.user
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists"
            });
        }

        next();

    } catch (err) {
        console.error("AUTH ERROR:", err);
        res.status(401).json({
            success: false,
            message: "Authorization failed"
        });
    }
};
