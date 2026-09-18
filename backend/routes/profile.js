const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const BeautyProfile = require('../models/BeautyProfile');
const User = require('../models/User');
const Product = require('../models/Product');
const Service = require('../models/Service');
const router = express.Router();

// ---------------------------------------------------------------
// رفع صورة البروفايل
// ---------------------------------------------------------------
const AVATARS_DIR = path.join(__dirname, '..', 'uploads', 'avatars');
fs.mkdirSync(AVATARS_DIR, { recursive: true });

const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, AVATARS_DIR),
    filename: (req, file, cb) => cb(null, `av-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`)
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype))
});

// بيانات الحساب (الاسم/الإيميل/التلفون/العنوان) + الصورة
const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone || '',
  role: u.role,
  avatar: u.avatar || '',
  location: u.location || { city: '', address: '' }
});

// GET — بيانات الحساب الحالية
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(publicUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching account', error: error.message });
  }
});

// PUT — تعديل بيانات الحساب
router.put('/account', async (req, res) => {
  try {
    const { name, email, phone, city, address } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'الاسم مطلوب' });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'البريد الإلكتروني غير صحيح' });
    }

    // الإيميل لازم يكون غير مستخدم من حساب تاني
    const duplicate = await User.findOne({ email: email.trim().toLowerCase(), _id: { $ne: req.user.id } });
    if (duplicate) {
      return res.status(400).json({ message: 'هذا البريد الإلكتروني مستخدم من حساب آخر' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name.trim();
    user.email = email.trim().toLowerCase();
    user.phone = phone?.trim() || user.phone || '';
    user.location = {
      city: city?.trim() || user.location?.city || '',
      address: address?.trim() || user.location?.address || ''
    };

    await user.save();
    res.json({ user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Error updating account', error: error.message });
  }
});

// POST — رفع / تغيير صورة البروفايل
router.post('/avatar', avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'اختار صورة صالحة (JPG / PNG / WEBP) بحجم أقصى 2MB' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // نحذف الصورة القديمة لو موجودة محلياً
    if (user.avatar?.startsWith('/uploads/avatars/')) {
      const oldPath = path.join(__dirname, '..', user.avatar);
      fs.unlink(oldPath, () => {});
    }

    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({ avatar: user.avatar, user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading avatar', error: error.message });
  }
});

// DELETE — حذف صورة البروفايل
router.delete('/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.avatar?.startsWith('/uploads/avatars/')) {
      const oldPath = path.join(__dirname, '..', user.avatar);
      fs.unlink(oldPath, () => {});
    }
    user.avatar = '';
    await user.save();

    res.json({ avatar: '', user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Error removing avatar', error: error.message });
  }
});

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
      // ما في beauty profile بعد — نرجّع بنية فاضية بدل 404
      // حتى ما يفشلش الـ Promise.all في صفحة الـ dashboard
      return res.json({ routine: [], products: [], services: [] });
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