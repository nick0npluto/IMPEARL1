const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// Create/Update Freelancer Profile
router.post('/freelancer', auth, async (req, res) => {
  try {
    const {
      name,
      expertise,
      yearsExperience,
      pastProjects,
      portfolioLinks,
      hourlyRate,
      availability
    } = req.body;

    // Validation
    if (!name || !expertise || !yearsExperience) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, expertise, and years of experience'
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.userType !== 'freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Only freelancers can create a freelancer profile'
      });
    }

    // Update freelancer profile
    user.freelancerProfile = {
      name,
      expertise,
      yearsExperience,
      pastProjects: pastProjects || '',
      portfolioLinks: portfolioLinks || '',
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
      availability: availability || 'not-available',
      bio: pastProjects || '',
      rating: user.freelancerProfile?.rating || 0,
      reviewCount: user.freelancerProfile?.reviewCount || 0
    };

    await user.save();

    res.json({
      success: true,
      message: 'Freelancer profile created successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Create freelancer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating freelancer profile',
      error: error.message
    });
  }
});

// Create/Update Business Profile
router.post('/business', auth, async (req, res) => {
  try {
    const {
      businessName,
      industry,
      companySize,
      goals,
      requiredSkills,
      website,
      description
    } = req.body;

    // Validation
    if (!businessName || !industry || !goals) {
      return res.status(400).json({
        success: false,
        message: 'Please provide business name, industry, and goals'
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.userType !== 'business') {
      return res.status(403).json({
        success: false,
        message: 'Only businesses can create a business profile'
      });
    }

    // Update business profile
    user.businessProfile = {
      businessName,
      industry,
      companySize: companySize || '',
      goals,
      requiredSkills: requiredSkills || '',
      website: website || '',
      description: description || ''
    };

    await user.save();

    res.json({
      success: true,
      message: 'Business profile created successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Create business profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating business profile',
      error: error.message
    });
  }
});

// Get all freelancers (for search/browse)
router.get('/freelancers', auth, async (req, res) => {
  try {
    const freelancers = await User.find({ 
      userType: 'freelancer',
      'freelancerProfile.name': { $exists: true, $ne: '' }
    }).select('-password');

    res.json({
      success: true,
      freelancers
    });
  } catch (error) {
    console.error('Get freelancers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching freelancers',
      error: error.message
    });
  }
});

// Get single freelancer by ID
router.get('/freelancer/:id', auth, async (req, res) => {
  try {
    const freelancer = await User.findOne({
      _id: req.params.id,
      userType: 'freelancer'
    }).select('-password');

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer not found'
      });
    }

    res.json({
      success: true,
      freelancer
    });
  } catch (error) {
    console.error('Get freelancer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching freelancer',
      error: error.message
    });
  }
});

module.exports = router;
