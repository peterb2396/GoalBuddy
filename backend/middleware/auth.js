const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    console.log('🔐 Auth Middleware - Path:', req.path);
    console.log('🔐 Auth Header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'NONE');
    
    if (!authHeader) {
      console.log('❌ No authorization header');
      return res.status(401).json({ error: 'No token provided' });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      console.log('❌ Invalid authorization format:', authHeader.substring(0, 20));
      return res.status(401).json({ error: 'Invalid authorization format. Must be: Bearer <token>' });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token || token.trim() === '') {
      console.log('❌ Empty token after Bearer');
      return res.status(401).json({ error: 'Empty token' });
    }
    
    console.log('🔑 Token received (first 20 chars):', token.substring(0, 20) + '...');
    
    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || 'jwt';
    console.log('🔐 Using JWT_SECRET:', JWT_SECRET.substring(0, 10) + '...');
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('✅ Token verified for user:', decoded.userId);
    
    // Add user info to request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    
    next();
  } catch (error) {
    console.log('❌ Auth error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token: ' + error.message });
    }
    return res.status(401).json({ error: 'Authentication failed: ' + error.message });
  }
};

module.exports = authMiddleware;
