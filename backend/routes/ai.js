// 🤖 AI Assistant routes — شات بوت + مستشار جمال
const express = require('express');
const { generateReply, consultationReply } = require('../utils/aiEngine');
const BeautyProfile = require('../models/BeautyProfile');
const Product = require('../models/Product');
const Service = require('../models/Service');

const router = express.Router();

// شات حر — الرسالة تتوجه للمحرك الذكي
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const reply = await generateReply({ message: String(message), user: req.user });
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: 'AI assistant error', error: error.message });
  }
});

// استشارة جمال كاملة بناءً على beauty profile
router.get('/consultation', async (req, res) => {
  try {
    const profile = await BeautyProfile.findOne({ userId: req.user.id });

    let products = [];
    let services = [];
    if (profile?.skinType) {
      products = await Product.find({ skinTypes: profile.skinType }).limit(3);
      services = await Service.find({ category: 'skincare' }).limit(2);
    } else {
      products = await Product.find().limit(3);
    }

    const reply = await consultationReply(profile || { ...products, skinType: null });
    res.json({ reply, hasProfile: Boolean(profile) });
  } catch (error) {
    res.status(500).json({ message: 'Consultation error', error: error.message });
  }
});

module.exports = router;