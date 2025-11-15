const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');
const auth = require('../middleware/auth');

// Get all contracts for a user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const contracts = await Contract.find({
      $or: [
        { businessId: userId },
        { freelancerId: userId }
      ]
    })
    .populate('businessId', 'email businessProfile')
    .populate('freelancerId', 'email freelancerProfile')
    .sort({ createdAt: -1 });

    res.json({ success: true, contracts });
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single contract
router.get('/:id', auth, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('businessId', 'email businessProfile')
      .populate('freelancerId', 'email freelancerProfile');

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    // Verify user is part of contract
    if (contract.businessId._id.toString() !== req.user.userId && 
        contract.freelancerId._id.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, contract });
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new contract
router.post('/', auth, async (req, res) => {
  try {
    const { freelancerId, projectTitle, projectDescription, budget, deadline } = req.body;
    
    const contract = new Contract({
      businessId: req.user.userId,
      freelancerId,
      projectTitle,
      projectDescription,
      budget,
      deadline,
      status: 'pending'
    });

    await contract.save();

    const populatedContract = await Contract.findById(contract._id)
      .populate('businessId', 'email businessProfile')
      .populate('freelancerId', 'email freelancerProfile');

    res.status(201).json({ success: true, contract: populatedContract });
  } catch (error) {
    console.error('Create contract error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update contract status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    // Verify user is part of contract
    if (contract.businessId.toString() !== req.user.userId && 
        contract.freelancerId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    contract.status = status;
    
    if (status === 'active') {
      contract.acceptedAt = new Date();
    } else if (status === 'completed') {
      contract.completedAt = new Date();
    }

    await contract.save();

    const updatedContract = await Contract.findById(contract._id)
      .populate('businessId', 'email businessProfile')
      .populate('freelancerId', 'email freelancerProfile');

    res.json({ success: true, contract: updatedContract });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Leave a review
router.put('/:id/review', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    // Only business can leave review
    if (contract.businessId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Only business can leave review' });
    }

    // Contract must be completed
    if (contract.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Contract must be completed first' });
    }

    contract.review = {
      rating,
      comment,
      createdAt: new Date()
    };

    await contract.save();

    const updatedContract = await Contract.findById(contract._id)
      .populate('businessId', 'email businessProfile')
      .populate('freelancerId', 'email freelancerProfile');

    res.json({ success: true, contract: updatedContract });
  } catch (error) {
    console.error('Leave review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
