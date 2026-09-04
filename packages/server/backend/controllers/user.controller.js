// src/controllers/auth.controller.js"
import { googleAuthService } from '../services/auth.service.js';
import User from "../models/user.model.js";

export const handleGoogleAuth = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: 'Access token is required' });
    }

    const user = await googleAuthService(accessToken);

    req.session.userId = user._id;

    return res.status(200).json({
      message: 'Authentication successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Authentication failed' });
  }
};

export const handleLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logged out successfully' });
  });
};

export const getCurrentUser = async (req, res) => {
  try {

    // what is use of googleId in user model? is it necessary to exclude it from the response? : The `googleId` field in the user model is typically used to store the unique identifier provided by Google when a user authenticates via Google OAuth. This ID can be useful for linking the user's account in your application with their Google account, allowing for features like single sign-on or retrieving additional information from Google.
    const user = await User.findById(req.session.userId).select('-googleId -__v -createdAt -updatedAt'); // Exclude sensitive fields
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};