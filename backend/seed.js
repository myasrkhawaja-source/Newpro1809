const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Service = require('./models/Service');
const bcrypt = require('bcryptjs');

const ensureAdminUser = async () => {
  const existingAdmin = await User.findOne({ email: 'admin@beautyhub.com' });
  if (existingAdmin) {
    console.log('Admin user already exists');
    return existingAdmin;
  }

  const admin = await User.create({
    name: 'Beauty Hub Admin',
    email: 'admin@beautyhub.com',
    password: 'admin12345',
    phone: '0500000000',
    role: 'admin',
    location: { city: 'Nazareth', address: 'Admin Office' }
  });

  console.log('Created default admin user');
  return admin;
};

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/beautyhub');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Service.deleteMany({});
    console.log('Cleared existing data');

    const adminUser = await ensureAdminUser();
    console.log('Default admin ready:', adminUser.email, '/ admin12345');

    // Create sample users
    // ملاحظة: كلمة المرور تُشفَّر تلقائياً بواسطة pre-save hook في User model — لا نشفرها يدوياً هنا
    const users = await User.create([
      {
        name: 'Sarah Ahmed',
        email: 'sarah@example.com',
        password: 'password123',
        phone: '050-1234567',
        role: 'user',
        location: { city: 'Nazareth', address: 'Main Street 123' }
      },
      {
        name: 'Layla Hassan',
        email: 'layla@example.com',
        password: 'password123',
        phone: '052-7654321',
        role: 'provider',
        location: { city: 'Nazareth', address: 'Beauty Center, Floor 2' }
      },
      {
        name: 'Maya Cohen',
        email: 'maya@example.com',
        password: 'password123',
        phone: '054-9876543',
        role: 'provider',
        location: { city: 'Haifa', address: 'Downtown Beauty Studio' }
      }
    ]);
    console.log('Created users');

    // Create sample products
    const products = await Product.create([
      {
        name: 'Gentle Cleanser',
        brand: 'CeraVe',
        category: 'skincare',
        subcategory: 'cleanser',
        price: 75,
        description: 'Gentle foaming cleanser for all skin types',
        skinTypes: ['oily', 'combination', 'normal'],
        rating: 4.5,
        reviewCount: 120
      },
      {
        name: 'Hydrating Moisturizer',
        brand: 'Neutrogena',
        category: 'skincare',
        subcategory: 'moisturizer',
        price: 85,
        description: 'Deep hydration for dry skin',
        skinTypes: ['dry', 'sensitive', 'normal'],
        rating: 4.7,
        reviewCount: 95
      },
      {
        name: 'Oil-Control Toner',
        brand: 'The Ordinary',
        category: 'skincare',
        subcategory: 'toner',
        price: 60,
        description: 'Controls excess oil and minimizes pores',
        skinTypes: ['oily', 'combination'],
        rating: 4.3,
        reviewCount: 78
      },
      {
        name: 'SPF 50 Sunscreen',
        brand: 'La Roche-Posay',
        category: 'skincare',
        subcategory: 'sunscreen',
        price: 95,
        description: 'Lightweight daily sunscreen',
        skinTypes: ['oily', 'dry', 'combination', 'sensitive', 'normal'],
        rating: 4.8,
        reviewCount: 200
      },
      {
        name: 'Full Coverage Foundation',
        brand: 'Maybelline',
        category: 'makeup',
        subcategory: 'foundation',
        price: 65,
        description: 'Long-lasting full coverage foundation',
        skinTypes: ['oily', 'combination', 'normal'],
        rating: 4.4,
        reviewCount: 150
      },
      {
        name: 'Volumizing Mascara',
        brand: 'L\'Oreal',
        category: 'makeup',
        subcategory: 'mascara',
        price: 45,
        description: 'Dramatic volume and length',
        skinTypes: ['oily', 'dry', 'combination', 'sensitive', 'normal'],
        rating: 4.6,
        reviewCount: 180
      },
      {
        name: 'Powder Blush',
        brand: 'NYX',
        category: 'makeup',
        subcategory: 'blush',
        price: 40,
        description: 'Silky smooth powder blush',
        skinTypes: ['oily', 'dry', 'combination', 'sensitive', 'normal'],
        rating: 4.2,
        reviewCount: 90
      },
      {
        name: 'Long-lasting Lip Gloss',
        brand: 'MAC',
        category: 'makeup',
        subcategory: 'lipgloss',
        price: 70,
        description: 'High-shine long-lasting lip gloss',
        skinTypes: ['oily', 'dry', 'combination', 'sensitive', 'normal'],
        rating: 4.5,
        reviewCount: 110
      }
    ]);
    console.log('Created products');

    // Create sample services
    const services = await Service.create([
      {
        providerId: users[1]._id,
        name: 'Bridal Makeup',
        category: 'makeup',
        description: 'Complete bridal makeup package including trial session',
        price: 450,
        duration: 120,
        location: { city: 'Nazareth', address: 'Beauty Center, Floor 2' },
        rating: 4.9,
        reviewCount: 45,
        available: true
      },
      {
        providerId: users[1]._id,
        name: 'Party Makeup',
        category: 'makeup',
        description: 'Glamorous makeup for parties and special occasions',
        price: 250,
        duration: 60,
        location: { city: 'Nazareth', address: 'Beauty Center, Floor 2' },
        rating: 4.8,
        reviewCount: 32,
        available: true
      },
      {
        providerId: users[2]._id,
        name: 'Hair Styling',
        category: 'hair',
        description: 'Professional hair styling for any occasion',
        price: 180,
        duration: 90,
        location: { city: 'Haifa', address: 'Downtown Beauty Studio' },
        rating: 4.7,
        reviewCount: 28,
        available: true
      },
      {
        providerId: users[2]._id,
        name: 'Nail Art',
        category: 'nails',
        description: 'Creative nail art and manicure',
        price: 120,
        duration: 60,
        location: { city: 'Haifa', address: 'Downtown Beauty Studio' },
        rating: 4.6,
        reviewCount: 35,
        available: true
      },
      {
        providerId: users[1]._id,
        name: 'Skincare Treatment',
        category: 'skincare',
        description: 'Deep cleansing and rejuvenating facial',
        price: 200,
        duration: 75,
        location: { city: 'Nazareth', address: 'Beauty Center, Floor 2' },
        rating: 4.8,
        reviewCount: 40,
        available: true
      }
    ]);
    console.log('Created services');

    // ===== بيانات تجريبية إضافية: مفضلات + حجوزات + طلبات =====
    const Favorite = require('./models/Favorite');
    const Order = require('./models/Order');
    const Booking = require('./models/Booking');

    await Favorite.deleteMany({});
    await Booking.deleteMany({});
    await Order.deleteMany({});

    const sarah = users[0];

    await Favorite.create([
      { userId: sarah._id, itemId: products[0]._id, itemType: 'product' },
      { userId: sarah._id, itemId: products[1]._id, itemType: 'product' },
      { userId: sarah._id, itemId: services[0]._id, itemType: 'service' }
    ]);
    console.log('Created sample favorites');

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    futureDate.setHours(0, 0, 0, 0);

    await Booking.create({
      userId: sarah._id,
      serviceId: services[1]._id,
      providerId: services[1].providerId,
      date: futureDate,
      time: '14:00',
      location: { city: services[1].location?.city || 'Nazareth', address: services[1].location?.address || '' },
      status: 'pending',
      totalPrice: services[1].price,
      notes: 'Sample booking'
    });
    console.log('Created sample booking');

    await Order.create({
      userId: sarah._id,
      items: [
        { product: products[0]._id, name: products[0].name, price: products[0].price, quantity: 2 },
        { product: products[1]._id, name: products[1].name, price: products[1].price, quantity: 1 }
      ],
      totalPrice: products[0].price * 2 + products[1].price,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'card'
    });
    console.log('Created sample order');

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📋 Sample Users:');
    console.log('1. sarah@example.com / password123 (User)');
    console.log('2. layla@example.com / password123 (Provider)');
    console.log('3. maya@example.com / password123 (Provider)');
    console.log('\n📦 Products created:', products.length);
    console.log('💄 Services created:', services.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
