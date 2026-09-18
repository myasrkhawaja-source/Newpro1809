const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../utils/email');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'beautyhub_secret_key';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, location } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      phone,
      role: role || 'user',
      location
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        avatar: user.avatar || ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        avatar: user.avatar || ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: 'If an account exists for this email, a reset link has been sent.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, resetLink);

    res.status(200).json({
      message: 'If an account exists for this email, a reset link has been sent.',
      resetToken,
      resetUrl: resetLink
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reset link', error: error.message });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

// ===============================================================
// 🔗 تسجيل الدخول الاجتماعي — Google & Facebook
// شغال فعلياً بمجرد إضافة المفاتيح في .env:
//   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
//   FACEBOOK_APP_ID / FACEBOOK_APP_SECRET
// لو المفاتيح مش موجودة → بيرجّع المستخدم لصفحة التسجيل برسالة
// ===============================================================

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5000';
const EMAIL_RE = /^\S+@\S+\.\S+$/;

const socialProvider = (name) => ({
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    scope: 'openid email profile',
    redirectUri: `${BACKEND_URL}/api/auth/google/callback`
  },
  facebook: {
    clientId: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    userUrl: 'https://graph.facebook.com/me?fields=id,name,email,picture.width(256).height(256)',
    scope: 'email public_profile',
    redirectUri: `${BACKEND_URL}/api/auth/facebook/callback`
  }
}[name]);

// بدء تسجيل الدخول — لو مش مفعّل نرجّع المستخدم لصفحة التسجيل برسالة
router.get('/:provider(google|facebook)', (req, res) => {
  const p = socialProvider(req.params.provider);

  if (!p?.clientId || !p?.clientSecret) {
    return res.redirect(`${CLIENT_URL}/register?social=not_configured&provider=${req.params.provider}`);
  }

  const params = new URLSearchParams({
    client_id: p.clientId,
    redirect_uri: p.redirectUri,
    response_type: 'code',
    scope: p.scope
  });
  if (req.params.provider === 'google') params.append('access_type', 'offline');
  res.redirect(`${p.authUrl}?${params}`);
});

// الكولباك — نستبدل الكود بمعلومات المستخدم ونعمل حساب تلقائي
async function handleSocialCallback(req, res, providerName) {
  try {
    const p = socialProvider(providerName);
    const code = req.query.code;

    if (!code) {
      return res.redirect(`${CLIENT_URL}/register?social=failed&provider=${providerName}`);
    }

    // 1) استبدال الكود بـ access token
    const tokenRes = await fetch(p.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: p.clientId,
        client_secret: p.clientSecret,
        redirect_uri: p.redirectUri,
        grant_type: 'authorization_code'
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.redirect(`${CLIENT_URL}/register?social=failed&provider=${providerName}`);
    }

    // 2) جلب بيانات المستخدم
    const userRes = await fetch(p.userUrl, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const profile = await userRes.json();

    const email = profile.email?.toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
      return res.redirect(`${CLIENT_URL}/register?social=no_email&provider=${providerName}`);
    }

    // 3) إيجاد أو إنشاء الحساب
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: profile.name || email.split('@')[0],
        email,
        // باسورد عشوائي مش هيتستخدم (الدخول عن طريق البروفايدر)
        password: crypto.randomBytes(24).toString('hex'),
        phone: profile.phone || '',
        avatar: profile.picture || ''
      });
    }

    // 4) إصدار JWT وتحويل المستخدم للواجهة
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${CLIENT_URL}/social-callback?token=${token}`);
  } catch (error) {
    res.redirect(`${CLIENT_URL}/register?social=failed&provider=${providerName}`);
  }
}

router.get('/google/callback', (req, res) => handleSocialCallback(req, res, 'google'));
router.get('/facebook/callback', (req, res) => handleSocialCallback(req, res, 'facebook'));

module.exports = router;