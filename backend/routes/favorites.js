const express = require('express');
const Favorite = require('../models/Favorite');
const Product = require('../models/Product');
const Service = require('../models/Service');
const router = express.Router();

// جلب مفضلات المستخدم مع تفاصيل العناصر
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const favorites = await Favorite.find({ userId }).sort({ createdAt: -1 });

    const populatedFavorites = await Promise.all(
      favorites.map(async (favorite) => {
        const plain = favorite.toObject();
        if (favorite.itemType === 'product') {
          plain.itemId = await Product.findById(favorite.itemId).select('name price brand image category description');
        } else {
          plain.itemId = await Service.findById(favorite.itemId).select('name price images duration category description location');
        }
        return plain;
      })
    );

    // تنظيف المفضلات التي حُذفت عناصرها من قاعدة البيانات
    const validFavorites = populatedFavorites.filter((favorite) => favorite.itemId);
    const removedIds = populatedFavorites
      .filter((favorite) => !favorite.itemId)
      .map((favorite) => favorite._id);

    if (removedIds.length > 0) {
      await Favorite.deleteMany({ _id: { $in: removedIds } });
    }

    res.json(validFavorites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
});

// إضافة للمفضلات (بدون تكرار)
router.post('/', async (req, res) => {
  try {
    const { itemId, itemType } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!itemId || !['product', 'service'].includes(itemType)) {
      return res.status(400).json({ message: 'itemId and a valid itemType (product/service) are required' });
    }

    const ItemModel = itemType === 'product' ? Product : Service;
    const itemExists = await ItemModel.findById(itemId);
    if (!itemExists) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const existing = await Favorite.findOne({ userId, itemId, itemType });
    if (existing) {
      return res.status(200).json({ message: 'Already in favorites', favorite: existing });
    }

    const favorite = await Favorite.create({ userId, itemId, itemType });
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to favorites', error: error.message });
  }
});

// حذف من المفضلات (يعمل مع معرف المفضلة أو معرف العنصر مباشرة)
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user?.id;

    let favorite = await Favorite.findOne({ _id: req.params.id, userId });

    if (!favorite) {
      favorite = await Favorite.findOne({ itemId: req.params.id, userId });
    }

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    await favorite.deleteOne();
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from favorites', error: error.message });
  }
});

module.exports = router;
