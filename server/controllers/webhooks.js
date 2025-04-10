import { Webhook } from "svix";
import User from "../models/User.js";

// List of required Svix headers
const REQUIRED_HEADERS = [
  'svix-id',
  'svix-timestamp',
  'svix-signature'
];

// Enhanced header validation
const validateHeaders = (headers) => {
  const missingHeaders = REQUIRED_HEADERS.filter(h => !headers[h]);
  
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }

  return {
    svixId: headers['svix-id'],
    svixTimestamp: headers['svix-timestamp'],
    svixSignature: headers['svix-signature']
  };
};

export const clerkWebhooks = async (req, res) => {
  try {
    // Validate headers first
    const { svixId, svixTimestamp, svixSignature } = validateHeaders(req.headers);

    // Verify webhook signature
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature
    });

    // Rest of your webhook handling logic...
    const { data, type } = req.body;

    if (!data || !data.id) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing data or user ID in webhook payload" 
      });
    }

    // ... rest of your switch cases

  } catch (error) {
    console.error("Webhook processing error:", error);
    
    // Special handling for header errors
    if (error.message.includes('Missing required headers')) {
      return res.status(400).json({
        success: false,
        message: error.message,
        solution: "Ensure your webhook requests include all required Svix headers"
      });
    }

    // General error response
    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};