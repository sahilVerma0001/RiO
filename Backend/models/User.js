import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    forgotOtp: String,
    forgotOtpExpires: Date,
    role: { type: String, enum: ["owner", "user"], default: 'user' },
    image: { type: String, default: '' },
    isVerified: {
        type: Boolean,
        default: false,
    },
    addresses: [
        {
            type: {
                type: String,
                enum: ["home", "work", "other"],
                default: "home"
            },
            house: String,
            street: String,
            city: String,
            state: String,
            pincode: String,
            country: String,
            isDefault: { type: Boolean, default: false }
        }
    ],
    otp: String,
    otpExpires: Date,
}, { timestamps: true })

const User = mongoose.model('User', userSchema);

export default User;