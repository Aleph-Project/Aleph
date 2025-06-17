import mongoose from "mongoose";

const AUTH_MONGO_URI = process.env.AUTH_MONGO_URI || "";

export const connectDB = async () => {
    try {
        await mongoose.connect(AUTH_MONGO_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};
