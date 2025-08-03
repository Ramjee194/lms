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

dotenv.config();
const app = express();

// --------------------
// 1️⃣ Webhooks first (raw body)
// --------------------
app.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhookHandler);
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// --------------------
// 2️⃣ CORS (single, correct config)
// --------------------
app.use(cors({
  origin: ["http://localhost:5173"], // add prod URL here
  credentials: true
}));

// --------------------
// 3️⃣ Other middleware
// --------------------
app.use(express.json());       // normal JSON parser
app.use(clerkMiddleware());    // Clerk auth middleware

// --------------------
// 4️⃣ Connect DB + Cloudinary
// --------------------
await connectDB();
await connectCloudinary();

// --------------------
// 5️⃣ Routes
// --------------------
app.get('/', (req, res) => {
  res.send('LMS API is running...');
});

app.use('/api/user', userRouter);
app.use('/api/educator', educatorRouter);
app.use('/api/course', courseRouter);

// --------------------
// 6️⃣ Start Server
// --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
