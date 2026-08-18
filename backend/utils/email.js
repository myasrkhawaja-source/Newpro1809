const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@beautyhub.local';

const transporter = SMTP_HOST && SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    })
  : null;

const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    console.log('📧 Email service not configured. Email preview:');
    console.log({ to, subject, text: text || html });
    return { messageId: 'demo-email' };
  }

  return transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    text,
    html
  });
};

const sendPasswordResetEmail = async (email, resetLink) => {
  const subject = 'Beauty Hub - Password Reset';
  const text = `Use the following link to reset your password: ${resetLink}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Beauty Hub</h2>
      <p>Click the button below to reset your password:</p>
      <p><a href="${resetLink}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;">Reset Password</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

const sendOrderConfirmationEmail = async (email, order) => {
  const subject = 'Beauty Hub - Order Confirmation';
  const itemList = (order.items || [])
    .map((item) => `<li>${item.name} x ${item.quantity} — ₪${item.price * item.quantity}</li>`)
    .join('');

  const text = `Your order has been confirmed. Total: ₪${order.totalAmount}.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Order Confirmed</h2>
      <p>Thanks for shopping with Beauty Hub.</p>
      <ul>${itemList}</ul>
      <p><strong>Total:</strong> ₪${order.totalAmount}</p>
      <p>Your order number is #${order._id}</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

const sendBookingConfirmationEmail = async (email, booking) => {
  const subject = 'Beauty Hub - Booking Confirmed ✨';
  const bookingDate = new Date(booking.date).toLocaleDateString();
  const text = `Your booking for ${booking.serviceId?.name} has been confirmed for ${bookingDate} at ${booking.time}.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7c6cff;">✨ Booking Confirmed</h2>
      <p>Your booking has been successfully created!</p>
      
      <div style="background: #f7f5ff; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <h3 style="color: #2d2342; margin-top: 0;">${booking.serviceId?.name}</h3>
        <p><strong>📅 Date:</strong> ${bookingDate}</p>
        <p><strong>⏰ Time:</strong> ${booking.time}</p>
        <p><strong>📍 Location:</strong> ${booking.location?.city || 'TBA'}</p>
        <p><strong>💰 Price:</strong> ₪${booking.totalPrice}</p>
        <p><strong>👤 Provider:</strong> ${booking.providerId?.name}</p>
      </div>

      ${booking.notes ? `<p><strong>📝 Notes:</strong> ${booking.notes}</p>` : ''}
      
      <p style="color: #6a6780;">Booking ID: ${booking._id}</p>
      <p>Thank you for choosing Beauty Hub!</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

const sendProviderNotificationEmail = async (email, booking, providerName) => {
  const subject = 'Beauty Hub - New Booking Request 🔔';
  const bookingDate = new Date(booking.date).toLocaleDateString();
  const text = `You have a new booking request from ${booking.userId?.name} for ${booking.serviceId?.name}.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7c6cff;">🔔 New Booking Request</h2>
      <p>Hi ${providerName},</p>
      <p>You have a new booking request!</p>
      
      <div style="background: #f7f5ff; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <h3 style="color: #2d2342; margin-top: 0;">${booking.serviceId?.name}</h3>
        <p><strong>👤 Customer:</strong> ${booking.userId?.name}</p>
        <p><strong>📧 Email:</strong> ${booking.userId?.email}</p>
        <p><strong>📅 Requested Date:</strong> ${bookingDate}</p>
        <p><strong>⏰ Requested Time:</strong> ${booking.time}</p>
        <p><strong>📍 Location:</strong> ${booking.location?.city || 'TBA'}</p>
        <p><strong>💰 Rate:</strong> ₪${booking.totalPrice}</p>
      </div>

      ${booking.notes ? `<p><strong>📝 Customer Notes:</strong> ${booking.notes}</p>` : ''}
      
      <p>Status: <strong style="color: #f8b84c;">Pending Confirmation</strong></p>
      <p>Please review and confirm this booking in your dashboard.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

const sendPaymentConfirmationEmail = async (email, booking) => {
  const subject = 'Beauty Hub - Payment Confirmed ✅';
  const bookingDate = new Date(booking.date).toLocaleDateString();
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4dcc90;">✅ Payment Confirmed</h2>
      <p>Thank you! Your payment has been successfully processed.</p>
      
      <div style="background: #d4edda; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <p><strong>Amount Paid:</strong> ₪${booking.totalPrice}</p>
        <p><strong>Payment Method:</strong> ${booking.paymentMethod}</p>
        <p><strong>Service:</strong> ${booking.serviceId?.name}</p>
        <p><strong>Scheduled:</strong> ${bookingDate} at ${booking.time}</p>
      </div>

      <p>Your booking is now <strong>confirmed</strong>. The provider will contact you shortly if needed.</p>
      <p style="color: #6a6780; font-size: 12px;">Transaction ID: ${booking._id}</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendBookingConfirmationEmail,
  sendProviderNotificationEmail,
  sendPaymentConfirmationEmail
};
