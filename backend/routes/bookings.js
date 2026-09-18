const express = require('express');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Notification = require('../models/Notification');

const router = express.Router();

// التحقق من صيغة الوقت (HH:MM) وضمن ساعات العمل 09:00 - 20:00
const isValidTime = (time) => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time || '');
  if (!match) return false;
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  return minutes >= 9 * 60 && minutes <= 20 * 60;
};

// إنشاء حجز جديد (خدمة بموعد محدد)
router.post('/', async (req, res) => {
  try {
    const { serviceId, date, time, location, notes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!serviceId || !date || !time) {
      return res.status(400).json({ message: 'Service, date, and time are required' });
    }

    if (!isValidTime(time)) {
      return res.status(400).json({ message: 'Working hours are 09:00 - 20:00. Please choose a valid time (e.g. 14:30).' });
    }

    const requestedDate = new Date(date);
    if (Number.isNaN(requestedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const dayStart = new Date(requestedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(requestedDate);
    dayEnd.setHours(23, 59, 59, 999);

    if (dayEnd < new Date()) {
      return res.status(400).json({ message: 'Cannot book an appointment in the past' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.available === false) {
      return res.status(400).json({ message: 'This service is currently unavailable' });
    }

    // منع تعارض المواعيد لنفس المزود في نفس اليوم والوقت
    const conflict = await Booking.findOne({
      providerId: service.providerId,
      date: { $gte: dayStart, $lte: dayEnd },
      time,
      status: { $ne: 'cancelled' }
    });

    if (conflict) {
      return res.status(409).json({ message: 'This time slot is already booked. Please choose another time.' });
    }

    const booking = await Booking.create({
      userId,
      serviceId,
      providerId: service.providerId,
      date: dayStart,
      time,
      location: {
        city: location?.city || service.location?.city || '',
        address: location?.address || service.location?.address || ''
      },
      totalPrice: service.price,
      notes: notes || ''
    });

    // إشعار داخلي للمستخدم
    try {
      await Notification.create({
        userId,
        title: 'Booking Confirmed 📅',
        message: `Your booking for "${service.name}" on ${dayStart.toDateString()} at ${time} has been received.`,
        type: 'booking',
        bookingId: booking._id
      });
    } catch (notificationError) {
      console.error('Notification error:', notificationError.message);
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
});

// حجوزات المستخدم الحالي
router.get('/my-bookings', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const bookings = await Booking.find({ userId })
      .populate('serviceId', 'name price duration category description images')
      .populate('providerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// إلغاء حجز
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Completed bookings cannot be cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking', error: error.message });
  }
});

// إضافة مراجعة لحجز
router.post('/:id/review', async (req, res) => {
  try {
    const { rating, text } = req.body;
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    booking.review = {
      rating,
      text: text || '',
      createdAt: new Date()
    };
    await booking.save();

    // إعادة حساب تقييم الخدمة بناءً على كل المراجعات
    const stats = await Booking.aggregate([
      { $match: { serviceId: booking.serviceId, 'review.rating': { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$review.rating' }, count: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      await Service.findByIdAndUpdate(booking.serviceId, {
        rating: Math.round(stats[0].avg * 10) / 10,
        reviewCount: stats[0].count
      });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting review', error: error.message });
  }
});

// الدفع لحجز
router.post('/:id/payment', async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'This booking is already paid' });
    }

    booking.paymentStatus = 'paid';
    booking.paymentMethod = paymentMethod || 'card';
    booking.status = 'confirmed';
    await booking.save();

    try {
      await Notification.create({
        userId: booking.userId,
        title: 'Payment Successful 💳',
        message: `Your payment of ₪${booking.totalPrice} was received. The booking is now confirmed.`,
        type: 'payment',
        bookingId: booking._id
      });
    } catch (notificationError) {
      console.error('Notification error:', notificationError.message);
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
});

module.exports = router;

