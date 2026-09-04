// src/services/auth/auth.service.js
import User from "../models/user.model.js";

export const googleAuthService = async (accessToken) => {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info from Google');
  }

  const googleUser = await response.json();
  const { email, name, sub: googleId, picture } = googleUser;

  if (!email) {
    throw new Error('Google account missing email address');
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      name,
      googleId,
      avatar: picture || '',
      phoneNumber: '',
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    if (picture && !user.avatar) user.avatar = picture;
    await user.save();
  }

  return user;
};