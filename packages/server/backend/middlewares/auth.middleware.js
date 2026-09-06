import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.userId = decoded.userId;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Session expired or invalid token. Please log in again." });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.session && req.session.userId) {
    // Assuming you have a way to check if the user is an admin, e.g., a role field in the session or user model
    if (req.session.isAdmin) {
      return next();
    }
    return res.status(403).json({ message: 'Forbidden. Admins only.' });
  }
}