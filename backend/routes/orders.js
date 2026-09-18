const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

const router = express.Router();

// إنشاء طلب جديد (شراء منتجات من السلة)
router.post('/', async (req, res) => {
  try {
    const { items, paymentMethod } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one product' });
    }

    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    const orderItems = [];
    for (const item of items) {
      const product = products.find((p) => p._id.toString() === String(item.productId));
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      const quantity = Math.max(1, Number(item.quantity) || 1);
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity
      });
    }

    const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      userId,
      items: orderItems,
      totalPrice,
      paymentStatus: 'paid',
      paymentMethod: paymentMethod || 'card',
      status: 'confirmed'
    });

    try {
      await Notification.create({
        userId,
        title: 'Order Placed 🛍️',
        message: `Your order with ${orderItems.length} product(s) (₪${totalPrice}) has been placed successfully.`,
        type: 'system'
      });
    } catch (notificationError) {
      console.error('Notification error:', notificationError.message);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// طلبات المستخدم الحالي
router.get('/my-orders', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

module.exports = router;
