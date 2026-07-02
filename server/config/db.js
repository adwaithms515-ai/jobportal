const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jobportal');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed admin user if missing
    const User = require('../models/User');
    const adminEmail = 'admin@portal.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: 'password123',
        role: 'admin'
      });
      console.log(`Default Admin user created automatically (${adminEmail}).`);
    }
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
