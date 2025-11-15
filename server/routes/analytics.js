const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');
const Payment = require('../models/Payment');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get analytics for user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userType = user.userType;

    if (userType === 'freelancer') {
      // Freelancer analytics
      const contracts = await Contract.find({ freelancerId: userId });
      const payments = await Payment.find({ payeeId: userId });

      const completedContracts = contracts.filter(c => c.status === 'completed');
      const activeContracts = contracts.filter(c => c.status === 'active');
      
      const totalEarnings = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const pendingEarnings = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

      // Calculate average rating
      const reviewedContracts = contracts.filter(c => c.review && c.review.rating);
      const avgRating = reviewedContracts.length > 0
        ? reviewedContracts.reduce((sum, c) => sum + c.review.rating, 0) / reviewedContracts.length
        : 0;

      // Calculate success rate
      const successRate = contracts.length > 0
        ? (completedContracts.length / contracts.length) * 100
        : 0;

      // Earnings over time (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const earningsOverTime = await Payment.aggregate([
        {
          $match: {
            payeeId: user._id,
            status: 'completed',
            paidDate: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$paidDate' },
              month: { $month: '$paidDate' }
            },
            total: { $sum: '$amount' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);

      const analytics = {
        totalEarnings,
        completedJobs: completedContracts.length,
        averageRating: avgRating.toFixed(1),
        activeProjects: activeContracts.length,
        pendingEarnings,
        successRate: successRate.toFixed(1),
        earningsOverTime: earningsOverTime.map(item => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          amount: item.total
        }))
      };

      res.json({ success: true, analytics, userType: 'freelancer' });

    } else if (userType === 'business') {
      // Business analytics
      const contracts = await Contract.find({ businessId: userId });
      const payments = await Payment.find({ payerId: userId });

      const completedContracts = contracts.filter(c => c.status === 'completed');
      const activeContracts = contracts.filter(c => c.status === 'active');
      
      const totalSpent = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const pendingPayments = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

      // Get unique freelancers hired
      const uniqueFreelancers = [...new Set(contracts.map(c => c.freelancerId.toString()))];

      // Calculate completion rate
      const completionRate = contracts.length > 0
        ? (completedContracts.length / contracts.length) * 100
        : 0;

      // Reviews left
      const reviewsLeft = contracts.filter(c => c.review && c.review.rating).length;

      // Spending over time (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const spendingOverTime = await Payment.aggregate([
        {
          $match: {
            payerId: user._id,
            status: 'completed',
            paidDate: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$paidDate' },
              month: { $month: '$paidDate' }
            },
            total: { $sum: '$amount' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);

      const analytics = {
        totalSpent,
        completedProjects: completedContracts.length,
        freelancersHired: uniqueFreelancers.length,
        activeProjects: activeContracts.length,
        pendingPayments,
        reviewsLeft,
        completionRate: completionRate.toFixed(1),
        spendingOverTime: spendingOverTime.map(item => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          amount: item.total
        }))
      };

      res.json({ success: true, analytics, userType: 'business' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user type' });
    }

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
