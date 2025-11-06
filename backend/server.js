const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const { Expo } = require('expo-server-sdk');
require('dotenv').config();

const Goal = require('./models/Goal');
const PushToken = require('./models/PushToken');

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

// ========== HELPER FUNCTIONS ==========

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
    
    const tokens = await PushToken.find({});
    const goals = await Goal.find({ isCompleted: false }).sort({ priority: -1, order: 1 });
    
    // Reset continuous goals if needed
    for (const goal of goals) {
      await checkAndResetGoal(goal);
    }
    
    const topGoals = goals.slice(0, 3);
    
    if (topGoals.length === 0 || tokens.length === 0) {
      console.log('No goals or tokens to notify');
      return;
    }
    
    const messages = [];
    
    for (const tokenDoc of tokens) {
      if (!Expo.isExpoPushToken(tokenDoc.token)) {
        console.log(`Invalid token: ${tokenDoc.token}`);
        continue;
      }
      
      const goalTitles = topGoals.map(g => `• ${g.title}`).join('\n');
      
      messages.push({
        to: tokenDoc.token,
        sound: 'default',
        title: '🎯 Daily Goal Reminder',
        body: `Your top priorities:\n${goalTitles}\n\nTap to see all goals`,
        data: { type: 'daily_reminder' }
      });
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

// ========== API ROUTES ==========

// Get all goals
app.get('/api/goals', async (req, res) => {
  try {
    const goals = await Goal.find({}).sort({ order: 1 });
    
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
app.get('/api/goals/:id', async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
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
app.post('/api/goals', async (req, res) => {
  try {
    const goalCount = await Goal.countDocuments();
    
    const newGoal = new Goal({
      ...req.body,
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
app.put('/api/goals/:id', async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
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
app.delete('/api/goals/:id', async (req, res) => {
  try {
    const goal = await Goal.findByIdAndDelete(req.params.id);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reorder goals
app.post('/api/goals/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    
    for (let i = 0; i < orderedIds.length; i++) {
      await Goal.findByIdAndUpdate(orderedIds[i], { order: i });
    }
    
    const goals = await Goal.find({}).sort({ order: 1 });
    res.json(goals);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update sub-item
app.put('/api/goals/:goalId/subitems/:subItemId', async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId);
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

// Register push token
app.post('/api/push-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!Expo.isExpoPushToken(token)) {
      return res.status(400).json({ error: 'Invalid Expo push token' });
    }
    
    const existing = await PushToken.findOne({ token });
    if (existing) {
      return res.json({ message: 'Token already registered' });
    }
    
    const pushToken = new PushToken({ token });
    await pushToken.save();
    
    res.status(201).json({ message: 'Token registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Test notification endpoint
app.post('/api/test-notification', async (req, res) => {
  try {
    await sendDailyNotification();
    res.json({ message: 'Test notification sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
