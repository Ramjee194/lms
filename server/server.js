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


// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON requests
app.use(clerkMiddleware());

// Connect to database and cloudinary
await connectDB();
await connectCloudinary();

// Default test route
app.get('/', (req, res) => {
  res.send('LMS API is running...');
});


// Routes
app.post(
  '/clerk',
  express.raw({ type: 'application/json' }), 
  clerkWebhookHandler
);
app.use('/api',userRouter);
app.use('/api/educator',express.json(), educatorRouter);
app.use('/api/course',express.json(),courseRouter)
app.use('/api/user',express.json(),userRouter)
app.post('/stripe',express.raw({type:'application/json'}),stripeWebhooks
)




// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
