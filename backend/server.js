const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const { Expo } = require('expo-server-sdk');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Goal = require('./models/Goal');
const PushToken = require('./models/PushToken');
const authMiddleware = require('./middleware/auth');

const app = express();
const expo = new Expo();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/goal-tracker';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '30d';

// ========== HELPER FUNCTIONS ==========

// Generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Check if a goal should be reset
const checkAndResetGoal = async (goal) => {
  if (goal.type !== 'continuous' || !goal.lastResetDate) {
    return false;
  }

  const now = new Date();
  const lastReset = new Date(goal.lastResetDate);
  let shouldReset = false;

  switch (goal.resetFrequency) {
    case 'daily':
      const daysDiff = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));
      shouldReset = daysDiff >= 1;
      break;
    case 'weekly':
      const weeksDiff = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24 * 7));
      shouldReset = weeksDiff >= 1;
      break;
    case 'monthly':
      shouldReset = now.getMonth() !== lastReset.getMonth() || 
                    now.getFullYear() !== lastReset.getFullYear();
      break;
  }

  if (shouldReset) {
    goal.subItems.forEach(item => {
      if (item.type === 'checkbox') {
        item.isChecked = false;
      } else if (item.type === 'progress') {
        item.currentValue = 0;
      }
    });
    goal.lastResetDate = now;
    goal.isCompleted = false;
    await goal.save();
    return true;
  }

  return false;
};

// Calculate completion status
const calculateCompletion = (goal) => {
  if (goal.subItems.length === 0) return false;
  
  return goal.subItems.every(item => {
    if (item.type === 'checkbox') {
      return item.isChecked;
    } else if (item.type === 'progress') {
      return item.currentValue >= item.targetValue;
    }
    return false;
  });
};

// Send daily notification
const sendDailyNotification = async () => {
  try {
    console.log('🔔 Sending daily notifications...');
    
    // Get all users' tokens
    const tokens = await PushToken.find({}).populate('userId');
    
    // Group tokens by user
    const userTokens = {};
    tokens.forEach(tokenDoc => {
      if (tokenDoc.userId) {
        const userId = tokenDoc.userId._id.toString();
        if (!userTokens[userId]) {
          userTokens[userId] = [];
        }
        userTokens[userId].push(tokenDoc.token);
      }
    });
    
    const messages = [];
    
    // For each user, get their top goals and send notifications
    for (const [userId, userTokensList] of Object.entries(userTokens)) {
      const goals = await Goal.find({ 
        userId, 
        isCompleted: false 
      }).sort({ priority: -1, order: 1 });
      
      // Reset continuous goals if needed
      for (const goal of goals) {
        await checkAndResetGoal(goal);
      }
      
      const topGoals = goals.slice(0, 3);
      
      if (topGoals.length === 0) {
        continue;
      }
      
      const goalTitles = topGoals.map(g => `• ${g.title}`).join('\n');
      
      for (const token of userTokensList) {
        if (!Expo.isExpoPushToken(token)) {
          console.log(`Invalid token: ${token}`);
          continue;
        }
        
        messages.push({
          to: token,
          sound: 'default',
          title: '🎯 Daily Goal Reminder',
          body: `Your top priorities:\n${goalTitles}\n\nTap to see all goals`,
          data: { type: 'daily_reminder' }
        });
      }
    }
    
    if (messages.length === 0) {
      console.log('No notifications to send');
      return;
    }
    
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending notification chunk:', error);
      }
    }
    
    console.log(`✅ Sent ${tickets.length} notifications`);
  } catch (error) {
    console.error('Error in sendDailyNotification:', error);
  }
};

// Schedule daily notification at 8 AM
cron.schedule('0 8 * * *', sendDailyNotification);

// ========== AUTHENTICATION ROUTES ==========

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Create new user
    const user = new User({ email, password, name });
    await user.save();
    
    // Generate token
    const token = generateToken(user._id, user.email);
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate token
    const token = generateToken(user._id, user.email);
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user (protected route)
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== PROTECTED GOAL ROUTES ==========

// Get all goals for authenticated user
app.get('/api/goals', authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId }).sort({ order: 1 });
    
    // Check and reset continuous goals
    for (const goal of goals) {
      await checkAndResetGoal(goal);
    }
    
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single goal
app.get('/api/goals/:id', authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findOne({ 
      _id: req.params.id,
      userId: req.userId 
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    await checkAndResetGoal(goal);
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create goal
app.post('/api/goals', authMiddleware, async (req, res) => {
  try {
    const goalCount = await Goal.countDocuments({ userId: req.userId });
    
    const newGoal = new Goal({
      ...req.body,
      userId: req.userId,
      order: goalCount,
      lastResetDate: req.body.type === 'continuous' ? new Date() : null
    });
    
    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update goal
app.put('/api/goals/:id', authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findOne({ 
      _id: req.params.id,
      userId: req.userId 
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    Object.assign(goal, req.body);
    
    // Check completion status
    goal.isCompleted = calculateCompletion(goal);
    
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete goal
app.delete('/api/goals/:id', authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ 
      _id: req.params.id,
      userId: req.userId 
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reorder goals
app.post('/api/goals/reorder', authMiddleware, async (req, res) => {
  try {
    const { orderedIds } = req.body;
    
    // Verify all goals belong to the user
    const goals = await Goal.find({ 
      _id: { $in: orderedIds },
      userId: req.userId 
    });
    
    if (goals.length !== orderedIds.length) {
      return res.status(400).json({ error: 'Invalid goal IDs' });
    }
    
    for (let i = 0; i < orderedIds.length; i++) {
      await Goal.findByIdAndUpdate(orderedIds[i], { order: i });
    }
    
    const updatedGoals = await Goal.find({ userId: req.userId }).sort({ order: 1 });
    res.json(updatedGoals);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update sub-item
app.put('/api/goals/:goalId/subitems/:subItemId', authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findOne({ 
      _id: req.params.goalId,
      userId: req.userId 
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    const subItem = goal.subItems.find(item => item.id === req.params.subItemId);
    if (!subItem) {
      return res.status(404).json({ error: 'Sub-item not found' });
    }
    
    Object.assign(subItem, req.body);
    
    // Check completion status
    goal.isCompleted = calculateCompletion(goal);
    
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ========== PUSH NOTIFICATION ROUTES ==========

// Register push token
app.post('/api/push-token', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!Expo.isExpoPushToken(token)) {
      return res.status(400).json({ error: 'Invalid Expo push token' });
    }
    
    // Check if token already exists for this user
    const existing = await PushToken.findOne({ 
      token,
      userId: req.userId 
    });
    
    if (existing) {
      return res.json({ message: 'Token already registered' });
    }
    
    // Remove token from other users if it exists
    await PushToken.deleteMany({ token, userId: { $ne: req.userId } });
    
    const pushToken = new PushToken({ 
      token,
      userId: req.userId 
    });
    await pushToken.save();
    
    res.status(201).json({ message: 'Token registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Test notification endpoint
app.post('/api/test-notification', authMiddleware, async (req, res) => {
  try {
    await sendDailyNotification();
    res.json({ message: 'Test notification sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== HEALTH CHECK ==========

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
