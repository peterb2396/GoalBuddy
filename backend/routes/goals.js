const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Goal = require('../models/Goal');
const User = require('../models/User');
const { sendPushNotification } = require('../services/pushNotifications');

// Notify friends about goal achievement
async function notifyFriendsAboutGoal(userId, goalTitle, isSubgoal = false) {
  try {
    const user = await User.findById(userId).populate('friends', 'pushToken');
    const achievementType = isSubgoal ? 'subgoal' : 'goal';
    
    for (const friend of user.friends) {
      if (friend.pushToken) {
        await sendPushNotification(
          friend.pushToken,
          `${user.name} achieved a ${achievementType}!`,
          `${goalTitle}`
        );
      }
    }
  } catch (error) {
    console.error('Error notifying friends:', error);
  }
}

// Create goal
router.post('/', auth, async (req, res) => {
  try {
    console.log('📝 Creating goal for user:', req.userId);
    
    // Get the count of goals for this user to set order
    const goalCount = await Goal.countDocuments({ userId: req.userId });
    
    const goal = new Goal({
      ...req.body,
      userId: req.userId,
      order: goalCount
    });
    
    await goal.save();
    console.log('✅ Goal created:', goal._id);
    res.status(201).json(goal);
  } catch (error) {
    console.error('❌ Error creating goal:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Get all goals
router.get('/', auth, async (req, res) => {
  try {
    console.log('📋 Fetching goals for user:', req.userId);
    const goals = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 });
    console.log('✅ Found', goals.length, 'goals');
    res.json(goals);
  } catch (error) {
    console.error('❌ Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Get single goal
router.get('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    res.json(goal);
  } catch (error) {
    console.error('❌ Error fetching goal:', error);
    res.status(500).json({ error: 'Failed to fetch goal' });
  }
});

// Reorde goals using
/**
 * reorderGoals: async (orderedIds) => {
    const response = await api.post('/goals/reorder', { orderedIds });
    return response.data;
  }
 */
router.post('/reorder', auth, async (req, res) => {
  try {
    const { orderedIds } = req.body;
    console.log('🔀 Reordering goals for user:', req.userId);
    
    for (let index = 0; index < orderedIds.length; index++) {
      const goalId = orderedIds[index];
      await Goal.findOneAndUpdate(
        { _id: goalId, userId: req.userId },
        { order: index }
      );
    }
    
    console.log('✅ Goals reordered successfully');
    res.json({ message: 'Goals reordered successfully' });
  } catch (error) {
    console.error('❌ Error reordering goals:', error);
    res.status(500).json({ error: 'Failed to reorder goals' });
  }
});


// Update goal
router.put('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Check if goal was just completed
    if (req.body.status === 'completed' && goal.status === 'completed') {
      await notifyFriendsAboutGoal(req.userId, goal.title, false);
    }
    
    res.json(goal);
  } catch (error) {
    console.error('❌ Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// Delete goal
router.delete('/:id', auth, async (req, res) => {
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
    console.error('❌ Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// Toggle subgoal completion
router.patch('/:goalId/subgoals/:subgoalId/toggle', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({ 
      _id: req.params.goalId, 
      userId: req.userId 
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const subgoal = goal.subgoals.id(req.params.subgoalId);
    if (!subgoal) {
      return res.status(404).json({ error: 'Subgoal not found' });
    }

    const wasCompleted = subgoal.completed;
    subgoal.completed = !subgoal.completed;
    subgoal.completedAt = subgoal.completed ? new Date() : null;

    // Update progress
    const completedCount = goal.subgoals.filter(sg => sg.completed).length;
    goal.progress = Math.round((completedCount / goal.subgoals.length) * 100);

    await goal.save();

    // Notify friends if subgoal was just completed
    if (!wasCompleted && subgoal.completed) {
      await notifyFriendsAboutGoal(req.userId, `${goal.title} - ${subgoal.title}`, true);
    }

    res.json(goal);
  } catch (error) {
    console.error('❌ Error toggling subgoal:', error);
    res.status(500).json({ error: 'Failed to toggle subgoal' });
  }
});

module.exports = router;