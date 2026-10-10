const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/queueless';

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] MongoDB Connected to host: ${conn.connection.host}/${conn.connection.name}`);
  } catch (primaryError) {
    console.warn(`[Database] Standard MongoDB connection failed (${primaryError.message}).`);
    console.log('[Database] Starting built-in auto-healing embedded MongoDB instance...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();

      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] Embedded MongoDB connected successfully at ${conn.connection.host}`);
    } catch (memError) {
      console.error(`[Database Critical Error] Failed to initialize both local and embedded MongoDB: ${memError.message}`);
      process.exit(1);
    }
  }

  // Check and run auto-seeder if database is blank
  try {
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Database] Database is empty. Auto-seeding initial government demo data...');
      const seedData = require('../seeds/seedData');
      await seedData();
      console.log('[Database] Demo data seeded successfully.');
    }
  } catch (seedErr) {
    console.warn('[Database] Auto-seed warning:', seedErr.message);
  }
};

module.exports = connectDB;
