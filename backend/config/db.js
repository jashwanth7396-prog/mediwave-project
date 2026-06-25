import mongoose from 'mongoose';

const getMongoUri = () =>
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.MONGO_URL ||
  process.env.DATABASE_URL;

const isPlaceholderUri = (mongoUri) =>
  mongoUri.includes('USER:PASSWORD') ||
  mongoUri.includes('<username>') ||
  mongoUri.includes('<password>') ||
  mongoUri.includes('your-mongodb-atlas-uri');

const connectDB = async () => {
  try {
    const mongoUri = getMongoUri();

    if (!mongoUri) {
      throw new Error(
        'Missing MongoDB connection string. Set MONGODB_URI in your deployment environment.'
      );
    }

    if (isPlaceholderUri(mongoUri)) {
      throw new Error(
        'MONGODB_URI still contains a placeholder. Replace it with your real MongoDB Atlas connection string.'
      );
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
