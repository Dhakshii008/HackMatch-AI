const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { seedDemoUsers } = require('./seedDemoUsers');

dotenv.config();

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackmatch');
    }
  } catch (error) {
    console.error('Seed DB Connection Error', error);
  }
};

const seedData = async () => {
  await connectDB();
  console.log('Seeding data with 15 demo accounts...');
  try {
    const result = await seedDemoUsers({ reset: false });
    console.log('Seed completed successfully! 15 demo accounts ready.');
    return result;
  } catch (error) {
    console.error('Seed Error:', error);
    throw error;
  }
};

if (require.main === module) {
  seedData()
    .then(async () => {
      await mongoose.connection.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedData;
