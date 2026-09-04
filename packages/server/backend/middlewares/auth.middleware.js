// src/middlewares/auth.middleware.js
export const isAuthenticated = (req, res, next) => {

  if (req.session && req.session.userId) {
    
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized. Please log in.' });
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