export async function seedCoupons(client) {
  console.log('  🏷️   Seeding coupons...');

  await client.query(`
    INSERT INTO coupons
      (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, per_user_limit, is_active)
    VALUES
      ('WELCOME10',  'Welcome coupon — 10% off first order',   'percentage', 10,  299,  100,  NULL, 1, TRUE),
      ('FLAT50',     'Flat ₹50 off on orders above ₹499',      'fixed',      50,  499,  NULL, 500,  1, TRUE),
      ('HONEY20',    '20% off on orders above ₹999',           'percentage', 20,  999,  200,  200,  1, TRUE),
      ('TRYNEW15',   '15% off — try a new product',            'percentage', 15,  499,  150,  NULL, 1, TRUE)
    ON CONFLICT (code) DO NOTHING
  `);

  console.log('     ✅  Coupons seeded');
}
