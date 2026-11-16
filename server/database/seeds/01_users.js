import bcrypt from 'bcrypt';

export async function seedUsers(client) {
  console.log('  👤  Seeding users...');

  const adminPasswordHash = await bcrypt.hash('Admin@1234', 12);
  const customerPasswordHash = await bcrypt.hash('Customer@1234', 12);

  await client.query(`
    INSERT INTO users (name, email, phone, password_hash, role, is_active, email_verified)
    VALUES
      ('Sasi Admin',       'admin@sasihoney.com',    '9999999901', $1, 'admin',    TRUE, TRUE),
      ('Ravi Kumar',       'ravi@example.com',       '9999999902', $2, 'customer', TRUE, TRUE),
      ('Priya Nair',       'priya@example.com',      '9999999903', $2, 'customer', TRUE, TRUE),
      ('Anand Krishnan',   'anand@example.com',      '9999999904', $2, 'customer', TRUE, FALSE)
    ON CONFLICT (email) DO NOTHING
  `, [adminPasswordHash, customerPasswordHash]);

  console.log('     ✅  Users seeded');
}
