const express = require('express');
const Favorite = require('../models/Favorite');
const router = express.Router();

// Get user's favorites
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const favorites = await Favorite.find({ userId })
      .populate('itemId');

    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
});

// Add to favorites
router.post('/', async (req, res) => {
  try {
    const { itemId, itemType } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const favorite = new Favorite({
      userId,
      itemId,
      itemType
    });

    await favorite.save();
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to favorites', error: error.message });
  }
});

// Remove from favorites
router.delete('/:id', async (req, res) => {
  try {
    const favorite = await Favorite.findByIdAndDelete(req.params.id);
    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from favorites', error: error.message });
  }
});

module.exports = router;