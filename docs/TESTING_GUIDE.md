# Testing Guide - Beauty Hub Booking System

## 🧪 How to Test the New Features

### Prerequisites
1. Backend running on `http://localhost:5000`
2. Frontend running on `http://localhost:3002` (or 5173)
3. MongoDB running locally
4. Authenticated user account

### Test 1: Create a Booking

1. Go to **Services** page
2. Click **📅 Book Service** button on any service
3. Fill in the booking modal:
   - Select date and time
   - Enter city and address
   - Add optional notes
4. Click **Confirm Booking**

**Expected Results:**
- ✅ Booking card appears in **Bookings** page
- ✅ Status shows "Pending"
- ✅ **Server Console**: Shows email logs (if SMTP not configured)
  ```
  📧 Email service not configured. Email preview:
  { to: 'customer@example.com', subject: 'Beauty Hub - Booking Confirmed ✨', ... }
  ```
- ✅ Notification appears in notifications dropdown
- ✅ Provider gets booking notification

### Test 2: Process Payment

1. Go to **Bookings** page
2. Find a pending booking
3. Click **Pay Now** button
4. In payment modal:
   - Select payment method (Card/PayPal/Wallet)
   - Click **Pay ₪X.XX**

**Expected Results:**
- ✅ Booking status changes to "Confirmed"
- ✅ Payment status shows "Paid"
- ✅ **Server Console**: Shows payment confirmation email log
  ```
  📧 Email service not configured. Email preview:
  { to: 'customer@example.com', subject: 'Beauty Hub - Payment Confirmed ✅', ... }
  ```
- ✅ New notification created
- ✅ Provider gets payment notification

### Test 3: Check Notifications

1. Click **🔔 Notifications** icon in header
2. View notification list:
   - Booking created notifications
   - Payment confirmed notifications
   - Any other system notifications

**Expected Results:**
- ✅ Notifications display in order (newest first)
- ✅ Show notification type indicator
- ✅ Can mark as read by clicking
- ✅ Can delete notifications

### Test 4: Provider View (if available)

1. Log in as provider user
2. Go to **Provider Dashboard** (if implemented)
3. Check "Pending Bookings" section

**Expected Results:**
- ✅ Shows all new bookings for this provider
- ✅ Can see booking details and customer info
- ✅ Can accept/confirm bookings
- ✅ Notifications update in real-time

### Test 5: Email Logs (Development)

1. Open backend server console
2. Create a new booking
3. Process payment

**Look for logs like:**
```
📧 Email service not configured. Email preview:
{
  to: 'customer@email.com',
  subject: 'Beauty Hub - Booking Confirmed ✨',
  text: 'Your booking for Massage has been confirmed for 1/15/2025 at 14:00.',
  html: '<div>...</div>'
}
```

## 🔍 Debugging Tips

### Check Database

```bash
# View notifications in MongoDB
use beautyhub
db.notifications.find()

# View bookings with payment status
db.bookings.find({ 
  paymentStatus: { $ne: null } 
}).pretty()
```

### Check Frontend Console

```javascript
// Monitor API calls
// Open DevTools (F12) → Network tab
// Create booking and check /api/bookings POST request
// Response should include booking ID and status

// Check notifications state
// Console → Check localStorage
localStorage.getItem('token')  // Should have valid JWT
```

### Email Service Check

If emails not working:

1. **Check SMTP config**
   ```bash
   # In .env file, verify:
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=app-specific-password
   ```

2. **Gmail Setup** (if using Gmail)
   - Enable "Less secure app access"
   - Or use App Passwords (if 2FA enabled)
   - Generate specific app password

3. **View Email Logs**
   - Server console shows preview if SMTP fails
   - Check inbox (may take few seconds)
   - Check spam folder

## 📋 Test Scenarios

### Scenario 1: Happy Path
```
User logs in → Browses services → Books a service → Makes payment → Success
```

### Scenario 2: Cancel Booking
```
User creates booking → Changes mind → Cancels booking → Receives cancellation notification
```

### Scenario 3: Add Review
```
User's booking completed → User adds review (1-5 stars) → Review saved and displayed
```

### Scenario 4: Provider Workflow
```
Provider logs in → Checks pending bookings → Sees customer requests → 
Accepts booking → Receives booking confirmation → Ready to fulfill service
```

## 🎯 Key Things to Verify

- [ ] Bookings persist after refresh
- [ ] Notifications update without page reload
- [ ] Payment method selection works
- [ ] Booking status changes appropriately
- [ ] Emails log to console (development)
- [ ] No console errors in browser
- [ ] No errors in server logs
- [ ] Timestamps show correctly
- [ ] Responsive design on mobile
- [ ] Cancel functionality works

## 📱 Testing on Mobile

1. Open frontend on mobile device
2. Same flow as desktop
3. Check:
   - Modal responsiveness (95% width)
   - Button sizes (tap-friendly)
   - Text readability
   - Notification display

## ✅ Acceptance Criteria

All tests pass when:
1. Bookings can be created and displayed
2. Payments can be processed
3. Notifications appear and persist
4. Emails log to console (development)
5. No JavaScript errors
6. Status updates reflect payment/confirmation
7. Provider receives notifications
8. UI is responsive on all devices
