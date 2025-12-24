const { Client } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function seedData() {
  const client = new Client({
    host: 'localhost',
    port: 5433,
    database: 'barbershop_dev',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Create a test shop
    console.log('🏪 Creating test shop...');
    const shopId = uuidv4();
    await client.query(`
      INSERT INTO shops (id, name, address, phone, email, timezone, business_hours)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      shopId,
      'The Classic Barbershop',
      '123 Main St, Los Angeles, CA 90001',
      '+1-323-555-0100',
      'info@classicbarbershop.com',
      'America/Los_Angeles',
      JSON.stringify({
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '10:00', close: '17:00' },
        sunday: { closed: true }
      })
    ]);

    // Create a subscription for the shop
    await client.query(`
      INSERT INTO subscriptions (id, shop_id, tier, monthly_price, status)
      VALUES ($1, $2, $3, $4, $5)
    `, [uuidv4(), shopId, 'pro', 149.00, 'active']);

    // Create owner user
    console.log('👤 Creating owner user...');
    const ownerUserId = uuidv4();
    const ownerPassword = await bcrypt.hash('password123', 10);
    await client.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [ownerUserId, 'owner@barbershop.com', ownerPassword, 'John', 'Owner', 'owner', true]);

    // Create barber users
    console.log('✂️ Creating barber users...');
    const barberUsers = [
      { email: 'mike@barbershop.com', firstName: 'Mike', lastName: 'Johnson' },
      { email: 'sarah@barbershop.com', firstName: 'Sarah', lastName: 'Williams' }
    ];

    const barberIds = [];
    for (const barber of barberUsers) {
      const userId = uuidv4();
      const barberId = uuidv4();
      const password = await bcrypt.hash('barber123', 10);

      await client.query(`
        INSERT INTO users (id, email, password_hash, first_name, last_name, role, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [userId, barber.email, password, barber.firstName, barber.lastName, 'barber', true]);

      await client.query(`
        INSERT INTO barbers (id, user_id, shop_id, specialties, working_hours, accepts_walk_ins)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        barberId,
        userId,
        shopId,
        JSON.stringify(['fades', 'lineups', 'beard']),
        JSON.stringify({
          monday: { slots: ['09:00-18:00'] },
          tuesday: { slots: ['09:00-18:00'] },
          wednesday: { slots: ['09:00-18:00'] },
          thursday: { slots: ['09:00-18:00'] },
          friday: { slots: ['09:00-20:00'] },
          saturday: { slots: ['10:00-17:00'] }
        }),
        true
      ]);

      barberIds.push(barberId);
    }

    // Create client users
    console.log('👥 Creating client users...');
    const clientUsers = [
      { email: 'client1@example.com', firstName: 'David', lastName: 'Martinez' },
      { email: 'client2@example.com', firstName: 'James', lastName: 'Anderson' }
    ];

    for (const client of clientUsers) {
      const userId = uuidv4();
      const clientId = uuidv4();
      const password = await bcrypt.hash('client123', 10);

      await client.query(`
        INSERT INTO users (id, email, password_hash, first_name, last_name, role, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [userId, client.email, password, client.firstName, client.lastName, 'client', true]);

      await client.query(`
        INSERT INTO clients (id, user_id, shop_id, preferred_barber_id, loyalty_points, loyalty_tier, referral_code)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        clientId,
        userId,
        shopId,
        barberIds[0],
        250,
        'silver',
        Math.random().toString(36).substring(2, 10).toUpperCase()
      ]);
    }

    // Create services
    console.log('💇 Creating services...');
    const services = [
      { name: 'Fade', price: 35.00, duration: 30 },
      { name: 'Lineup', price: 25.00, duration: 20 },
      { name: 'Beard Trim', price: 20.00, duration: 15 },
      { name: 'Full Service', price: 50.00, duration: 45 }
    ];

    for (const service of services) {
      await client.query(`
        INSERT INTO services (id, shop_id, name, base_price, duration_minutes, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [uuidv4(), shopId, service.name, service.price, service.duration, true]);
    }

    // Create no-show rules
    await client.query(`
      INSERT INTO no_show_rules (id, shop_id, require_deposit, deposit_amount, backup_booking_enabled)
      VALUES ($1, $2, $3, $4, $5)
    `, [uuidv4(), shopId, true, 10.00, true]);

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Owner: owner@barbershop.com / password123');
    console.log('Barber 1: mike@barbershop.com / barber123');
    console.log('Barber 2: sarah@barbershop.com / barber123');
    console.log('Client 1: client1@example.com / client123');
    console.log('Client 2: client2@example.com / client123');

  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedData();
