// ./configs/mongodb.js
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            tls: true,  // <-- ensure TLS is enabled
            tlsAllowInvalidCertificates: false,
        });

        mongoose.connection.on('connected', () => {
            console.log('✅ Database connected');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
    } catch (err) {
        console.error('❌ Initial connection error:', err);
        process.exit(1);
    }
};

export default connectDB;
