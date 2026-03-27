const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config({ path: '../.env' });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // Check if admin exists
    const existing = await User.findOne({ email: 'admin@ngomarketplace.com' });
    if (existing) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    await User.create({
      email: 'admin@ngomarketplace.com',
      passwordHash: 'admin123',
      role: 'admin',
      isVerified: true,
      profileDetails: {
        name: 'Platform Admin',
        description: 'NGO Marketplace Administrator',
      },
    });

    console.log('Admin user created: admin@ngomarketplace.com / admin123');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
