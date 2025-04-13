import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './configs/mongodb.js';
import userRoutes from './routes/user.js'; // 🧠 Route file import

dotenv.config(); // Load env vars

const app = express();

// Connect to DB
await connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // ❗Important: JSON parser middleware

// Base Route
app.get('/', (req, res) => {
  res.send("App is working ✅");
});

// API routes
app.use('/api', userRoutes); // 💡 All user-related routes

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
