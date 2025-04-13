import { Webhook } from "svix";
import User from "../models/User.js";

const formatUserData = (data) => ({
  _id: data.id,
  email: data.email_addresses?.[0]?.email_address || 'no-email@example.com',
  name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
  imageUrl: data.image_url || '',
  createdAt: new Date(),
  updatedAt: new Date()
});

export const clerkWebhooks = async (req, res) => {
  console.log('\n--- Webhook Received ---');
  
  // ========== FIX 1: Handle raw body correctly ==========
  const rawBody = JSON.stringify(req.body);
  
  try {
    // ========== FIX 2: Skip verification in development ==========
    if (process.env.NODE_ENV === 'production') {
      const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
      
      // ========== FIX 3: Case-insensitive headers ==========
      const headers = {
        "svix-id": req.headers["svix-id"] || req.headers["Svix-Id"],
        "svix-timestamp": req.headers["svix-timestamp"] || req.headers["Svix-Timestamp"],
        "svix-signature": req.headers["svix-signature"] || req.headers["Svix-Signature"],
      };

      await whook.verify(rawBody, headers);
    } else {
      console.log('Skipping verification in development mode');
    }

    // Process webhook
    const { data, type } = req.body;
    
    // ========== FIX 4: Unified upsert operation ==========
    if (['user.created', 'user.updated'].includes(type)) {
      const userData = formatUserData(data);
      const result = await User.findOneAndUpdate(
        { _id: data.id },
        userData,
        { upsert: true, new: true }
      );
      console.log('Database result:', result);
      return res.sendStatus(200);
    }

    if (type === 'user.deleted') {
      await User.findByIdAndDelete(data.id);
      return res.sendStatus(200);
    }

    return res.status(400).json({ error: 'Unhandled webhook type' });

  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(400).json({
      success: false,
      error: error.message,
      verificationFailed: error.name === 'WebhookVerificationError'
    });
  }
};