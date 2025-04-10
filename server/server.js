import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './configs/mongodb.js';
import { clerlWebhooks } from './controllers/webhooks.js';

dotenv.config(); // Load environment variables

// Initialize express
const app = express();

// Connect to database
await connectDB();

// Middleware
app.use(cors());

// Routes
app.get('/', (req, res) => {
    res.send("App is working");
});
app.post('/clerk', express.json(), clerlWebhooks);

// Port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});
