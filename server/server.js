import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./configs/mongodb.js";
import connectCloudinary from "./configs/cloudinary.js";
import userRouter from "./routes/userRoutes.js";
import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoutes.js";
import { clerkMiddleware } from "@clerk/express";
import { clerkWebhookHandler, stripeWebhooks } from "./controllers/clerkWebhook.js";

dotenv.config();
const app = express();

// 1️⃣ Webhooks first (raw)
app.post("/clerk", express.raw({ type: "application/json" }), clerkWebhookHandler);
app.post("/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

// 2️⃣ CORS (only once)
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));

// 3️⃣ Other middleware
app.use(express.json());
app.use(clerkMiddleware());

// 4️⃣ Connect DB + Cloudinary
await connectDB();
await connectCloudinary();

// 5️⃣ Routes
app.get("/", (req, res) => res.send("LMS API is running..."));
app.use("/api/user", userRouter);
app.use("/api/educator", educatorRouter);
app.use("/api/course", courseRouter);

// 6️⃣ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
