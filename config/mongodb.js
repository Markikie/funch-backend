import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("Connected to MongoDB ✅");
        });

        await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`);

        console.log("MongoDB connection successful.");
    } catch (error) {
        console.error("Error connecting to MongoDB ❌:", error.message);
        process.exit(1);
    }
};

export default connectDB;