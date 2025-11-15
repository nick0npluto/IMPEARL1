const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Contract = require('../models/Contract');
const auth = require('../middleware/auth');

// Get all payments for a user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const payments = await Payment.find({
      $or: [
        { payerId: userId },
        { payeeId: userId }
      ]
    })
    .populate('contractId')
    .populate('payerId', 'email businessProfile')
    .populate('payeeId', 'email freelancerProfile')
    .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single payment
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('contractId')
      .populate('payerId', 'email businessProfile')
      .populate('payeeId', 'email freelancerProfile');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Verify user is part of payment
    if (payment.payerId._id.toString() !== req.user.userId && 
        payment.payeeId._id.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new payment
router.post('/', auth, async (req, res) => {
  try {
    const { contractId, amount, paymentMethod, dueDate, notes } = req.body;
    
    // Verify contract exists
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    // Verify user is business (payer)
    if (contract.businessId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Only business can create payments' });
    }

    // Generate invoice number
    const count = await Payment.countDocuments();
    const invoiceNumber = `INV-${Date.now()}-${count + 1}`;

    const payment = new Payment({
      contractId,
      payerId: contract.businessId,
      payeeId: contract.freelancerId,
      amount,
      invoiceNumber,
      paymentMethod,
      dueDate,
      notes,
      status: 'pending'
    });

    await payment.save();

    const populatedPayment = await Payment.findById(payment._id)
      .populate('contractId')
      .populate('payerId', 'email businessProfile')
      .populate('payeeId', 'email freelancerProfile');

    res.status(201).json({ success: true, payment: populatedPayment });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update payment status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Verify user is payer
    if (payment.payerId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Only payer can update status' });
    }

    payment.status = status;
    
    if (status === 'completed') {
      payment.paidDate = new Date();
    }

    await payment.save();

    const updatedPayment = await Payment.findById(payment._id)
      .populate('contractId')
      .populate('payerId', 'email businessProfile')
      .populate('payeeId', 'email freelancerProfile');

    res.json({ success: true, payment: updatedPayment });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get payment statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const payments = await Payment.find({
      $or: [
        { payerId: userId },
        { payeeId: userId }
      ]
    });

    const stats = {
      totalPaid: 0,
      totalReceived: 0,
      pendingPayments: 0,
      pendingReceivables: 0,
      completedPayments: 0,
      completedReceivables: 0
    };

    payments.forEach(payment => {
      if (payment.payerId.toString() === userId) {
        // User is payer
        if (payment.status === 'completed') {
          stats.totalPaid += payment.amount;
          stats.completedPayments++;
        } else if (payment.status === 'pending') {
          stats.pendingPayments += payment.amount;
        }
      } else {
        // User is payee
        if (payment.status === 'completed') {
          stats.totalReceived += payment.amount;
          stats.completedReceivables++;
        } else if (payment.status === 'pending') {
          stats.pendingReceivables += payment.amount;
        }
      }
    });

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
