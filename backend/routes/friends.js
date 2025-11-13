const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const { sendPushNotification } = require('../services/pushNotifications');

// Send friend request
router.post('/request', auth, async (req, res) => {
  try {
    const { email } = req.body;
    const senderId = req.userId;

    // Find recipient by email
    const recipient = await User.findOne({ email: email.toLowerCase() });
    if (!recipient) {
      return res.status(404).json({ error: 'User not found with that email' });
    }

    if (recipient._id.toString() === senderId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    // Check if already friends
    const sender = await User.findById(senderId);
    if (sender.friends.includes(recipient._id)) {
      return res.status(400).json({ error: 'Already friends with this user' });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipient._id, status: 'pending' },
        { sender: recipient._id, recipient: senderId, status: 'pending' }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already pending' });
    }

    // Create friend request
    const friendRequest = new FriendRequest({
      sender: senderId,
      recipient: recipient._id
    });

    await friendRequest.save();

    // Send push notification to recipient
    if (recipient.pushToken) {
      await sendPushNotification(
        recipient.pushToken,
        'New Friend Request',
        `${sender.name} wants to be your friend!`
      );
    }

    res.status(201).json({ 
      message: 'Friend request sent',
      request: await friendRequest.populate('sender recipient', 'name email')
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// Get pending friend requests (received)
router.get('/requests', auth, async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      recipient: req.userId,
      status: 'pending'
    }).populate('sender', 'name email');

    res.json(requests);
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ error: 'Failed to fetch friend requests' });
  }
});

// Get sent friend requests
router.get('/requests/sent', auth, async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      sender: req.userId,
      status: 'pending'
    }).populate('recipient', 'name email');

    res.json(requests);
  } catch (error) {
    console.error('Error fetching sent requests:', error);
    res.status(500).json({ error: 'Failed to fetch sent requests' });
  }
});

// Accept friend request
router.post('/request/:requestId/accept', auth, async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId)
      .populate('sender', 'name email pushToken');

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (request.recipient.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    // Update request status
    request.status = 'accepted';
    await request.save();

    // Add to both users' friends lists
    await User.findByIdAndUpdate(request.sender._id, {
      $addToSet: { friends: request.recipient }
    });

    await User.findByIdAndUpdate(request.recipient, {
      $addToSet: { friends: request.sender._id }
    });

    // Send push notification to sender
    const recipient = await User.findById(request.recipient);
    if (request.sender.pushToken) {
      await sendPushNotification(
        request.sender.pushToken,
        'Friend Request Accepted',
        `${recipient.name} accepted your friend request!`
      );
    }

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

// Reject friend request
router.post('/request/:requestId/reject', auth, async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (request.recipient.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ error: 'Failed to reject friend request' });
  }
});

// Get friends list
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friends', 'name email');

    res.json(user.friends || []);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

// Remove friend
router.delete('/:friendId', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      $pull: { friends: req.params.friendId }
    });

    await User.findByIdAndUpdate(req.params.friendId, {
      $pull: { friends: req.userId }
    });

    res.json({ message: 'Friend removed' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

module.exports = router;