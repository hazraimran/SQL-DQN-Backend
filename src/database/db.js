"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * Connects to MongoDB via Mongoose.
 * Modify the connection string according to your setup.
 */
const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sqlFantasyGame";
        await mongoose_1.default.connect(uri, {
        // For Mongoose v6+, no need for extra config
        });
        console.log("MongoDB connected.");
    }
    catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
};
exports.default = connectDB;
