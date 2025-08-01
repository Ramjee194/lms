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

// 👉 Clerk webhook: raw parser only for /clerk
app.post(
  '/clerk',
  express.raw({ type: 'application/json' }),
  clerkWebhookHandler
);

// 👉 Stripe webhook: raw parser only for /stripe
app.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhooks
);

// ⚠️ All other middleware should come **after** raw body routes
app.use(cors());
app.use(express.json()); // parse all other requests
app.use(clerkMiddleware());

// 🧠 DB + Cloudinary connect
await connectDB();
await connectCloudinary();

// ✅ Base route
app.get('/', (req, res) => {
  res.send('LMS API is running...');
});

// 🧭 API Routes
// Server.js
app.use('/api', userRouter); 
app.use('/api/educator', educatorRouter);
app.use('/api/course', courseRouter);
app.use('/api/user', userRouter);  // ✅ Ye sahi hai


// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
