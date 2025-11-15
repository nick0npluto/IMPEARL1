const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Contract = require('../models/Contract');
const auth = require('../middleware/auth');

// Get messages for a contract
router.get('/contract/:contractId', auth, async (req, res) => {
  try {
    const { contractId } = req.params;
    const userId = req.user.userId;

    // Verify user is part of contract
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    if (contract.businessId.toString() !== userId && 
        contract.freelancerId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const messages = await Message.find({ contractId })
      .populate('senderId', 'email businessProfile freelancerProfile')
      .populate('recipientId', 'email businessProfile freelancerProfile')
      .sort({ timestamp: 1 });

    // Mark messages as read
    await Message.updateMany(
      { contractId, recipientId: userId, read: false },
      { read: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all conversations (grouped by contract)
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all contracts for this user
    const contracts = await Contract.find({
      $or: [
        { businessId: userId },
        { freelancerId: userId }
      ]
    })
    .populate('businessId', 'email businessProfile')
    .populate('freelancerId', 'email freelancerProfile')
    .sort({ createdAt: -1 });

    // Get last message and unread count for each contract
    const conversations = await Promise.all(
      contracts.map(async (contract) => {
        const lastMessage = await Message.findOne({ contractId: contract._id })
          .sort({ timestamp: -1 });
        
        const unreadCount = await Message.countDocuments({
          contractId: contract._id,
          recipientId: userId,
          read: false
        });

        return {
          contract,
          lastMessage,
          unreadCount
        };
      })
    );

    res.json({ success: true, conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { contractId, message } = req.body;
    const senderId = req.user.userId;

    // Get contract to find recipient
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    // Verify sender is part of contract
    if (contract.businessId.toString() !== senderId && 
        contract.freelancerId.toString() !== senderId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Determine recipient
    const recipientId = contract.businessId.toString() === senderId 
      ? contract.freelancerId 
      : contract.businessId;

    const newMessage = new Message({
      contractId,
      senderId,
      recipientId,
      message,
    });

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'email businessProfile freelancerProfile')
      .populate('recipientId', 'email businessProfile freelancerProfile');

    res.json({ success: true, message: populatedMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark message as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.recipientId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    message.read = true;
    await message.save();

    res.json({ success: true, message });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get unread message count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipientId: req.user.userId,
      read: false
    });

    res.json({ success: true, count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
