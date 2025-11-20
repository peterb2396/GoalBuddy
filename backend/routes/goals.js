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

// Get all goals (owned by user or shared with user)
router.get('/', auth, async (req, res) => {
  try {
    console.log('📋 Fetching goals for user:', req.userId);
    
    // Get goals owned by user OR shared with user
    const goals = await Goal.find({
      $or: [
        { userId: req.userId },
        { sharedWith: req.userId }
      ]
    })
    .populate('userId', 'name email')
    .populate('sharedWith', 'name email')
    .sort({ createdAt: -1 });
    
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
    // Find the goal - allow owner or shared users to update
    const goal = await Goal.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.userId },
        { sharedWith: req.userId }
      ]
    }).populate('sharedWith', 'pushToken name');
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Check if goal was just completed
    const wasCompleted = goal.isCompleted;

    // Update the goal
    Object.assign(goal, req.body);
    await goal.save();

    // Populate user data
    await goal.populate('userId', 'name email');

    // Get the user who made the update
    const updater = await User.findById(req.userId);

    // Notify shared users if there was a significant update
    if (goal.sharedWith && goal.sharedWith.length > 0) {
      for (const sharedUser of goal.sharedWith) {
        // Don't notify the user who made the update
        if (sharedUser._id.toString() !== req.userId) {
          if (sharedUser.pushToken) {
            await sendPushNotification(
              sharedUser.pushToken,
              `${updater.name} updated shared goal`,
              `"${goal.title}" has been updated`
            );
          }
        }
      }

      // Also notify the owner if they're not the one who updated
      if (goal.userId._id.toString() !== req.userId) {
        const owner = await User.findById(goal.userId._id);
        if (owner && owner.pushToken) {
          await sendPushNotification(
            owner.pushToken,
            `${updater.name} updated your shared goal`,
            `"${goal.title}" has been updated`
          );
        }
      }
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

// Add user to shared goal
router.post('/:goalId/share', auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    
    if (!friendId) {
      return res.status(400).json({ error: 'Friend ID is required' });
    }

    const goal = await Goal.findOne({ 
      _id: req.params.goalId, 
      userId: req.userId 
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found or you do not own this goal' });
    }

    // Check if user exists
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already shared with this user
    if (goal.sharedWith.includes(friendId)) {
      return res.status(400).json({ error: 'Goal already shared with this user' });
    }

    // Add user to sharedWith array
    goal.sharedWith.push(friendId);
    await goal.save();

    // Populate the goal with user data
    await goal.populate('userId', 'name email');
    await goal.populate('sharedWith', 'name email');

    // Get the goal owner info
    const owner = await User.findById(req.userId);

    // Notify the friend they've been added to a goal
    if (friend.pushToken) {
      await sendPushNotification(
        friend.pushToken,
        `${owner.name} added you to a goal!`,
        `"${goal.title}" - Check it out and track progress together!`
      );
    }

    console.log(`✅ Goal ${goal._id} shared with user ${friendId}`);
    res.json(goal);
  } catch (error) {
    console.error('❌ Error sharing goal:', error);
    res.status(500).json({ error: 'Failed to share goal' });
  }
});

// Remove user from shared goal
router.delete('/:goalId/share/:friendId', auth, async (req, res) => {
  try {
    const { goalId, friendId } = req.params;

    const goal = await Goal.findOne({ 
      _id: goalId, 
      userId: req.userId 
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found or you do not own this goal' });
    }

    // Remove user from sharedWith array
    goal.sharedWith = goal.sharedWith.filter(id => id.toString() !== friendId);
    await goal.save();

    // Populate the goal with user data
    await goal.populate('userId', 'name email');
    await goal.populate('sharedWith', 'name email');

    console.log(`✅ User ${friendId} removed from goal ${goalId}`);
    res.json(goal);
  } catch (error) {
    console.error('❌ Error removing user from goal:', error);
    res.status(500).json({ error: 'Failed to remove user from goal' });
  }
});

module.exports = router;