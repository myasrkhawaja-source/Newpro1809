const express = require('express');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Notification = require('../models/Notification');
const { 
  sendEmail,
  sendOrderConfirmationEmail, 
  sendBookingConfirmationEmail, 
  sendProviderNotificationEmail, 
  sendPaymentConfirmationEmail 
} = require('../utils/email');
const router = express.Router();

// Get user's bookings
router.get('/my-bookings', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const bookings = await Booking.find({ userId })
      .populate('serviceId')
      .populate('providerId', 'name email')
      .sort({ date: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Get provider's bookings
router.get('/provider-bookings', async (req, res) => {
  try {
    const providerId = req.user?.id;
    if (!providerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const bookings = await Booking.find({ providerId })
      .populate('serviceId')
      .populate('userId', 'name email')
      .sort({ date: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Create booking
router.post('/', async (req, res) => {
  try {
    const { serviceId, date, time, notes, location } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const booking = new Booking({
      userId,
      serviceId,
      providerId: service.providerId,
      date,
      time,
      location,
      notes,
      totalPrice: service.price
    });

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('serviceId')
      .populate('providerId', 'name email')
      .populate('userId', 'name email');

    // Send confirmation email to customer
    if (populatedBooking?.userId?.email) {
      await sendBookingConfirmationEmail(populatedBooking.userId.email, populatedBooking);
    }

    // Send notification email to provider
    if (populatedBooking?.providerId?.email) {
      await sendProviderNotificationEmail(
        populatedBooking.providerId.email, 
        populatedBooking, 
        populatedBooking.providerId.name
      );

      // Create notification for provider
      await Notification.create({
        userId: populatedBooking.providerId._id,
        title: 'New Booking Request',
        message: `New booking from ${populatedBooking.userId.name} for ${populatedBooking.serviceId.name} on ${new Date(populatedBooking.date).toLocaleDateString()}`,
        type: 'provider',
        bookingId: populatedBooking._id,
        read: false
      });
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
});

// Update booking status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking', error: error.message });
  }
});

// Cancel booking
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== userId && booking.providerId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking', error: error.message });
  }
});

// Add review to booking
router.post('/:id/review', async (req, res) => {
  try {
    const { rating, text } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking || booking.userId.toString() !== userId) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    booking.review = {
      rating,
      text,
      createdAt: new Date()
    };

    await booking.save();
    res.json({ message: 'Review added', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
});

// Process payment
router.post('/:id/payment', async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const userId = req.user?.id;

    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('serviceId')
      .populate('providerId', 'name email');

    if (!booking || booking.userId._id.toString() !== userId) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot pay for cancelled booking' });
    }

    booking.paymentStatus = 'paid';
    booking.paymentMethod = paymentMethod;
    booking.status = 'confirmed';

    await booking.save();

    // Send payment confirmation email to customer
    if (booking.userId?.email) {
      await sendPaymentConfirmationEmail(booking.userId.email, booking);
    }

    // Create notification for customer
    await Notification.create({
      userId: booking.userId._id,
      title: 'Payment Confirmed',
      message: `Payment of ₪${booking.totalPrice} for ${booking.serviceId.name} has been confirmed`,
      type: 'payment',
      bookingId: booking._id,
      read: false
    });

    // Notify provider about confirmation
    if (booking.providerId?.email) {
      await sendEmail({ 
        to: booking.providerId.email,
        subject: 'Beauty Hub - Booking Confirmed by Customer',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4dcc90;">✅ Booking Confirmed</h2>
            <p>Hi ${booking.providerId.name},</p>
            <p>${booking.userId.name} has confirmed the booking for ${booking.serviceId.name}.</p>
            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
            <p><strong>Payment Status:</strong> Confirmed</p>
            <p>Please prepare for this appointment.</p>
          </div>
        `
      });

      // Create notification for provider
      await Notification.create({
        userId: booking.providerId._id,
        title: 'Booking Confirmed by Customer',
        message: `Booking from ${booking.userId.name} for ${booking.serviceId.name} has been confirmed and payment received`,
        type: 'booking',
        bookingId: booking._id,
        read: false
      });
    }

    res.json({ message: 'Payment processed', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
});

module.exports = router;