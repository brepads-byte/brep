const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// 1. Check if user is logged in (Authentication)
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get admin data, exclude password
      req.admin = await Admin.findById(decoded.id).select('-password');
      
      // Attach to req.user as well for compatibility
      req.user = req.admin; 

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// 2. Check if user is Super Admin (Authorization)
const superAdmin = (req, res, next) => {
  if (req.admin && req.admin.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized. Super Admin access required.' });
  }
};

// Export both functions
module.exports = { protect, superAdmin };