const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    console.log('📝 Registration attempt for:', email);

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password
    });

    await user.save();
    console.log('✅ User created:', user._id);

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'jwt';
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    console.log('🔑 Token generated for user:', user._id);
    console.log('🔑 Token (first 20 chars):', token.substring(0, 20) + '...');

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt for:', email);

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('✅ Password verified for:', email);

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'jwt';
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    console.log('🔑 Token generated for user:', user._id);
    console.log('🔑 Token (first 20 chars):', token.substring(0, 20) + '...');

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Update push token
router.post('/push-token', auth, async (req, res) => {
  try {
    const { pushToken } = req.body;
    
    console.log('📱 Updating push token for user:', req.userId);

    await User.findByIdAndUpdate(req.userId, { pushToken });

    res.json({ message: 'Push token updated successfully' });
  } catch (error) {
    console.error('❌ Error updating push token:', error);
    res.status(500).json({ error: 'Failed to update push token' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    console.log('👤 Fetching user data for:', req.userId);
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      console.log('❌ User not found:', req.userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ User data retrieved:', user.email);
    res.json(user);
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;