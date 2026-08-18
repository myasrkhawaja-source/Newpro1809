const express = require('express');
const BeautyProfile = require('../models/BeautyProfile');
const Product = require('../models/Product');
const Service = require('../models/Service');
const router = express.Router();

// Get user's beauty profile
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const profile = await BeautyProfile.findOne({ userId });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Create or update beauty profile
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const profileData = { ...req.body, userId };
    
    let profile = await BeautyProfile.findOne({ userId });
    if (profile) {
      profile = await BeautyProfile.findByIdAndUpdate(profile._id, profileData, { new: true });
    } else {
      profile = new BeautyProfile(profileData);
      await profile.save();
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error saving profile', error: error.message });
  }
});

// Get personalized recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const profile = await BeautyProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: 'Please complete your beauty profile first' });
    }

    // This is a simplified recommendation logic
    // In a real app, this would be more sophisticated
    const products = await Product.find({
      category: { $in: getRecommendedCategories(profile) }
    }).limit(4);

    const services = await Service.find({
      category: { $in: getRecommendedCategories(profile) }
    }).limit(4);

    const recommendations = {
      routine: generateRoutine(profile),
      products,
      services
    };

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Error generating recommendations', error: error.message });
  }
});

function getRecommendedCategories(profile) {
  const skinType = profile?.skinType || 'normal';
  const categoryMap = {
    oily: ['skincare', 'makeup'],
    dry: ['skincare', 'makeup'],
    sensitive: ['skincare'],
    combination: ['skincare', 'makeup'],
    normal: ['skincare', 'makeup', 'tools']
  };

  return categoryMap[skinType] || ['skincare', 'makeup'];
}

function generateRoutine(profile) {
  const routine = [];
  
  routine.push({ step: 'Cleanser', product: 'Gentle Cleanser', time: 'Morning & Night' });
  
  if (profile.skinType === 'oily') {
    routine.push({ step: 'Toner', product: 'Oil-Control Toner', time: 'Morning & Night' });
  } else if (profile.skinType === 'dry') {
    routine.push({ step: 'Serum', product: 'Hydrating Serum', time: 'Morning & Night' });
  }
  
  routine.push({ step: 'Moisturizer', product: 'Daily Moisturizer', time: 'Morning & Night' });
  routine.push({ step: 'Sunscreen', product: 'SPF 30+', time: 'Morning only' });

  return routine;
}

module.exports = router;