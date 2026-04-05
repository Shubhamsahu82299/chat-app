import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

// --- SIGNUP ---
export const signup = async (req, res) => {
    // 1. bio ko optional banaya hai taaki "missing details" na aaye
    const { fullName, email, password } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.json({ success: false, message: "Please fill all required fields" });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.json({ success: false, message: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Naya user banaya (bio default empty string ya schema se aayega)
        const newUser = await User.create({ 
            fullName, 
            email, 
            password: hashedPassword, 
            bio: req.body.bio || "" 
        });

        const token = generateToken(newUser._id);
        res.json({ success: true, newUser, token, message: "User created successfully" });

    } catch (error) {
        console.log("Signup Error:", error.message);
        res.json({ success: false, message: "Internal Server Error" });
    }
};

// --- LOGIN ---
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email });

        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        // FIX: 'process' ki jagah 'password' variable use kiya
        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        
        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(userData._id);
        res.json({ success: true, userData, token, message: "Login successful" });

    } catch (error) {
        console.log("Login Error:", error.message);
        res.json({ success: false, message: "Internal Server Error" });
    }
};

// --- CHECK AUTH ---
export const checkAuth = async (req, res) => {
    try {
        // req.user protectRoute middleware se aata hai
        res.json({ success: true, user: req.user, message: "User authenticated" });
    } catch (error) {
        console.log("CheckAuth Error:", error.message);
        res.json({ success: false, message: "Authentication failed" });
    }
};

// --- UPDATE PROFILE ---
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user._id;
        
        // FIX: Variable name mismatch 'updateUser' vs 'updatedUser' theek kiya
        let updatedUser;

        if (!profilePic) {
            // Sirf text details update karein
            updatedUser = await User.findByIdAndUpdate(
                userId, 
                { bio, fullName }, 
                { new: true }
            );
        } else {
            // Cloudinary par upload karein agar image hai
            const uploadResponse = await cloudinary.uploader.upload(profilePic, { 
                folder: "profilePics" 
            });
            updatedUser = await User.findByIdAndUpdate(
                userId, 
                { profilePic: uploadResponse.secure_url, fullName, bio }, 
                { new: true }
            );
        }

        res.json({ success: true, user: updatedUser });

    } catch (error) {
        console.log("UpdateProfile Error:", error.message);
        res.json({ success: false, message: "Failed to update profile" });
    }
};