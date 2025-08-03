import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./configs/mongodb.js";
import connectCloudinary from "./configs/cloudinary.js";

import { clerkMiddleware } from "@clerk/express";
import { clerkWebhookHandler, stripeWebhooks } from "./controllers/clerkWebhook.js";

import userRouter from "./routes/userRoutes.js";
import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoutes.js";

dotenv.config();
const app = express();

// ============================
// 1️⃣ Clerk + Stripe Webhooks
// ============================
app.post("/clerk", express.raw({ type: "application/json" }), clerkWebhookHandler);
app.post("/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

// ============================
// 2️⃣ Correct CORS Setup
// ============================

const allowedOrigins = [
  "http://localhost:5173",            // Local Dev
  "https://lms-1-ki76.onrender.com",  // Render Frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ✅ Needed for cookies & Clerk
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Handle OPTIONS Preflight
app.options("*", cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ✅ Parse JSON for all non-webhook routes
app.use(express.json());

// ✅ Clerk Middleware for auth
app.use(clerkMiddleware());

// ============================
// 3️⃣ Connect DB & Cloudinary
// ============================
await connectDB();
await connectCloudinary();

// ============================
// 4️⃣ Base Route
// ============================
app.get("/", (req, res) => {
  res.send("✅ LMS API is running...");
});

// ============================
// 5️⃣ API Routes
// ============================
app.use("/api/user", userRouter);
app.use("/api/educator", educatorRouter);
app.use("/api/course", courseRouter);

// ============================
// 6️⃣ Start Server
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
