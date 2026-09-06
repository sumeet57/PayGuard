import jwt from "jsonwebtoken";
import { googleAuthService } from "../services/auth.service.js";
import User from "../models/user.model.js";
import env from "../config/env.js";

export const handleGoogleAuth = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: "Access token is required" });
    }

    const user = await googleAuthService(accessToken);

    const token = jwt.sign(
      { userId: user._id },
      env.JWT_SECRET,
      { expiresIn: "14d" }
    );

    return res.status(200).json({
      message: "Authentication successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Authentication failed" });
  }
};

export const handleLogout = (req, res) => {
  return res.status(200).json({ message: "Logged out successfully" });
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-googleId -__v -createdAt -updatedAt");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};