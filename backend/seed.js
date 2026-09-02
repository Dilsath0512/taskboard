require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('./src/config/db');

const seedAdmin = async () => {
  const name = process.env.ADMIN_NAME || 'Admin';
  const email = process.env.ADMIN_EMAIL || 'admin@taskboard.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@1234';

  console.log('🌱 Seeding admin user...');
  console.log(`   Name:  ${name}`);
  console.log(`   Email: ${email}`);

  try {
    // Check if admin already exists
    const existing = await pool.query('SELECT id, role FROM users WHERE email = $1', [email]);
    
    if (existing.rows.length > 0) {
      if (existing.rows[0].role === 'admin') {
        console.log('✅ Admin user already exists. Skipping.');
        process.exit(0);
      } else {
        // Promote existing user to admin
        await pool.query('UPDATE users SET role = $1 WHERE email = $2', ['admin', email]);
        console.log('✅ Existing user promoted to admin.');
        process.exit(0);
      }
    }

    const password_hash = await bcrypt.hash(password, 12);
    const id = uuidv4();

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, 'admin')`,
      [id, name, email, password_hash]
    );

    console.log('');
    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Change this password in production!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedAdmin();
