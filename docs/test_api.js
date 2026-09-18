// سكربت اختبار شامل لكل الوظائف الجديدة
const BASE = 'http://localhost:5000';
const log = (n, msg) => console.log(`${n}) ${msg}`);

(async () => {
  // 1) تسجيل الدخول
  let r = await fetch(BASE + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sarah@example.com', password: 'password123' })
  });
  const login = await r.json();
  log(1, `LOGIN: ${r.status} - ${login.user?.name || login.message}`);
  const h = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + login.token };

  // 2) حجوزات المستخدم
  r = await fetch(BASE + '/api/bookings/my-bookings', { headers: h });
  const bookings = await r.json();
  log(2, `MY-BOOKINGS: ${r.status} - ${bookings.length} booking(s), first: ${bookings[0]?.serviceId?.name} at ${bookings[0]?.time} (${bookings[0]?.status})`);

  // 3) إنشاء حجز جديد بموعد
  const future = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0];
  r = await fetch(BASE + '/api/bookings', {
    method: 'POST', headers: h,
    body: JSON.stringify({ serviceId: bookings[0].serviceId._id, date: future, time: '11:00', location: { city: 'Haifa' } })
  });
  const newBooking = await r.json();
  log(3, `CREATE BOOKING: ${r.status} - status=${newBooking.status} total=${newBooking.totalPrice} date=${newBooking.date?.slice(0, 10)} time=${newBooking.time}`);

  // 4) منع تعارض المواعيد (نفس اليوم والوقت مرة ثانية)
  r = await fetch(BASE + '/api/bookings', {
    method: 'POST', headers: h,
    body: JSON.stringify({ serviceId: bookings[0].serviceId._id, date: future, time: '11:00' })
  });
  const conflict = await r.json();
  log(4, `CONFLICT CHECK: ${r.status} - ${conflict.message || 'no conflict detected!'}`);

  // 5) المفضلات
  r = await fetch(BASE + '/api/favorites', { headers: h });
  const favs = await r.json();
  log(5, `FAVORITES: ${r.status} - ${favs.length} item(s): ${favs.map(f => f.itemId?.name).join(', ')}`);

  // 6) إضافة مفضلة جديدة
  const products = await (await fetch(BASE + '/api/products')).json();
  r = await fetch(BASE + '/api/favorites', {
    method: 'POST', headers: h,
    body: JSON.stringify({ itemId: products[5]._id, itemType: 'product' })
  });
  log(6, `ADD FAVORITE: ${r.status}`);

  // 7) إنشاء طلب (شراء منتجات)
  r = await fetch(BASE + '/api/orders', {
    method: 'POST', headers: h,
    body: JSON.stringify({ items: [{ productId: products[2]._id, quantity: 2 }], paymentMethod: 'card' })
  });
  const order = await r.json();
  log(7, `CREATE ORDER: ${r.status} - total=${order.totalPrice} payment=${order.paymentStatus}`);

  // 8) سجل الطلبات
  r = await fetch(BASE + '/api/orders/my-orders', { headers: h });
  const orders = await r.json();
  log(8, `MY-ORDERS: ${r.status} - ${orders.length} order(s)`);

  console.log('\n=== ALL TESTS DONE ===');
  process.exit(0);
})().catch(e => { console.error('TEST ERROR:', e.message); process.exit(1); });
