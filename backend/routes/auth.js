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

// Delete account
router.delete('/account', auth, async (req, res) => {
  try {
    const userId = req.userId;
    console.log('🗑️ Account deletion requested for user:', userId);

    // Import models here to avoid circular dependencies
    const Goal = require('../models/Goal');
    const FriendRequest = require('../models/FriendRequest');

    // 1. Delete all goals owned by the user
    const deletedGoals = await Goal.deleteMany({ userId });
    console.log(`✅ Deleted ${deletedGoals.deletedCount} goals owned by user`);

    // 2. Remove user from sharedWith arrays in all goals
    const updatedGoals = await Goal.updateMany(
      { sharedWith: userId },
      { $pull: { sharedWith: userId } }
    );
    console.log(`✅ Removed user from ${updatedGoals.modifiedCount} shared goals`);

    // 3. Remove user from friends lists of other users
    const updatedFriends = await User.updateMany(
      { friends: userId },
      { $pull: { friends: userId } }
    );
    console.log(`✅ Removed user from ${updatedFriends.modifiedCount} friends lists`);

    // 4. Delete all friend requests involving the user
    const deletedRequests = await FriendRequest.deleteMany({
      $or: [{ from: userId }, { to: userId }]
    });
    console.log(`✅ Deleted ${deletedRequests.deletedCount} friend requests`);

    // 5. Delete the user account
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`✅ Account deleted successfully: ${deletedUser.email}`);
    
    res.json({ 
      message: 'Account deleted successfully',
      deleted: {
        goals: deletedGoals.deletedCount,
        friendRequests: deletedRequests.deletedCount,
        friendConnections: updatedFriends.modifiedCount,
        sharedGoals: updatedGoals.modifiedCount
      }
    });
  } catch (error) {
    console.error('❌ Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;