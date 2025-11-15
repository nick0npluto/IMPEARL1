const express = require('express');
const router = express.Router();
const Proposal = require('../models/Proposal');
const auth = require('../middleware/auth');

// Get all proposals for a freelancer
router.get('/freelancer', auth, async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancerId: req.user.userId })
      .populate('businessId', 'email businessProfile')
      .sort({ createdAt: -1 });

    res.json({ success: true, proposals });
  } catch (error) {
    console.error('Get freelancer proposals error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all proposals for a business (for a specific job)
router.get('/business/:jobId', auth, async (req, res) => {
  try {
    const proposals = await Proposal.find({ 
      businessId: req.user.userId,
      jobId: req.params.jobId
    })
      .populate('freelancerId', 'email freelancerProfile')
      .sort({ createdAt: -1 });

    res.json({ success: true, proposals });
  } catch (error) {
    console.error('Get business proposals error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Submit a proposal
router.post('/', auth, async (req, res) => {
  try {
    const { jobId, jobTitle, businessId, proposalText, proposedRate, estimatedDuration } = req.body;

    // Check if freelancer already submitted proposal for this job
    const existingProposal = await Proposal.findOne({
      jobId,
      freelancerId: req.user.userId
    });

    if (existingProposal) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already submitted a proposal for this job' 
      });
    }

    const proposal = new Proposal({
      jobId,
      jobTitle,
      businessId,
      freelancerId: req.user.userId,
      proposalText,
      proposedRate,
      estimatedDuration,
      status: 'pending'
    });

    await proposal.save();

    const populatedProposal = await Proposal.findById(proposal._id)
      .populate('businessId', 'email businessProfile')
      .populate('freelancerId', 'email freelancerProfile');

    res.status(201).json({ success: true, proposal: populatedProposal });
  } catch (error) {
    console.error('Submit proposal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update proposal status (business accepts/rejects)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // Only business can update status
    if (proposal.businessId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Only business can update proposal status' });
    }

    proposal.status = status;
    proposal.respondedAt = new Date();

    await proposal.save();

    const updatedProposal = await Proposal.findById(proposal._id)
      .populate('businessId', 'email businessProfile')
      .populate('freelancerId', 'email freelancerProfile');

    res.json({ success: true, proposal: updatedProposal });
  } catch (error) {
    console.error('Update proposal status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Withdraw proposal (freelancer)
router.put('/:id/withdraw', auth, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // Only freelancer can withdraw their own proposal
    if (proposal.freelancerId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Can only withdraw pending proposals
    if (proposal.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only withdraw pending proposals' 
      });
    }

    proposal.status = 'withdrawn';
    await proposal.save();

    res.json({ success: true, proposal });
  } catch (error) {
    console.error('Withdraw proposal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get proposal statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancerId: req.user.userId });

    const stats = {
      totalProposals: proposals.length,
      pendingProposals: proposals.filter(p => p.status === 'pending').length,
      acceptedProposals: proposals.filter(p => p.status === 'accepted').length,
      rejectedProposals: proposals.filter(p => p.status === 'rejected').length,
      withdrawnProposals: proposals.filter(p => p.status === 'withdrawn').length,
      acceptanceRate: proposals.length > 0 
        ? ((proposals.filter(p => p.status === 'accepted').length / proposals.length) * 100).toFixed(1)
        : 0
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get proposal stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
