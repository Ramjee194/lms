import mongoose from "mongoose";



const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            tls: true,
            tlsAllowInvalidCertificates: false,
        });
        console.log("✅ Database connected");
    } catch (err) {
        console.error("❌ Initial connection error:", err.message || err);
    }

    mongoose.connection.on("error", (err) => {
        console.error("❌ Runtime MongoDB connection error:", err.message || err);
    });
};

export default connectDB;
