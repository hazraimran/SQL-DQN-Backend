import mongoose from "mongoose";

/**
 * Connects to MongoDB via Mongoose.
 * Modify the connection string according to your setup.
 */
const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sqlFantasyGame";
    await mongoose.connect(uri, {
      // For Mongoose v6+, no need for extra config
    });
    console.log("MongoDB connected.");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
