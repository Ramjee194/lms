import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './configs/mongodb.js';
import userRouter from './routes/userRoutes.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoutes.js';
import { clerkWebhookHandler, stripeWebhooks } from './controllers/clerkWebhook.js';
import Course from './models/Course.js';
import { dummyCourses } from '../server/assets.js';


dotenv.config();
const app = express();

// --------------------
// 1️ Webhooks first (raw body)
// --------------------
app.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhookHandler);
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// --------------------
// 2️ CORS (single, correct config)
// --------------------
app.use(cors({
  origin: ["http://localhost:5173"], // add prod URL here
  credentials: true
}));

// --------------------
// 3️ Other middleware
// --------------------
app.use(express.json());       // normal JSON parser
app.use(clerkMiddleware());    // Clerk auth middleware

// --------------------
// 4️Connect DB + Cloudinary
// --------------------
await connectDB();
await connectCloudinary();

// --------------------
// 5️ Routes
// --------------------
app.get('/', (req, res) => {
  res.send('LMS API is running...');
});

app.use('/api/user', userRouter);
app.use('/api/educator', educatorRouter);
app.use('/api/course', courseRouter);

// 🔹 Seed route (sirf ek baar chalana hai)
// 🔹 Seed route (sirf ek baar chalana hai)
app.get("/seed/courses", async (req, res) => {
  try {
    console.log("Dummy Courses Count:", dummyCourses.length);

    // Purane course delete
    await Course.deleteMany();

    // Insert new courses
    const inserted = await Course.insertMany(dummyCourses);

    res.json({ 
      success: true, 
      count: inserted.length, 
      message: "All dummy courses inserted successfully 🚀" 
    });
  } catch (err) {
    console.error("Seeding error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});



// --------------------
// 6️Start Server
// --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
