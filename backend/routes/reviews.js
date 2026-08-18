const express = require('express');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Service = require('../models/Service');
const router = express.Router();

// Get reviews for a target (service or product)
router.get('/:targetType/:targetId', async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const reviews = await Review.find({ targetType, targetId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// Create review
router.post('/', async (req, res) => {
  try {
    const { targetType, targetId, rating, comment } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const review = new Review({
      userId,
      targetType,
      targetId,
      rating,
      comment
    });

    await review.save();

    const Model = targetType === 'product' ? Product : Service;
    const target = await Model.findById(targetId);

    if (target) {
      const reviews = await Review.find({ targetType, targetId });
      const avgRating = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;

      target.rating = Number(avgRating.toFixed(1));
      target.reviewCount = reviews.length;
      await target.save();
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
});

// Update review
router.put('/:id', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findByIdAndUpdate(req.params.id, { rating, comment }, { new: true });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
});

// Delete review
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});

module.exports = router;