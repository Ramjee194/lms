import { Webhook } from 'svix';
import User from '../models/User.js';
import Stripe from 'stripe';
import { Purchase } from '../models/Purchase.js';
import Course from '../models/Course.js';
import dotenv from 'dotenv';



dotenv.config();
const formatUserData = (data) => ({
  _id: data.id,                     // This will act as MongoDB document _id
  clerkId: data.id,                // Required for querying with clerkId
  email: data.email_addresses?.[0]?.email_address || '',
  name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
  imageUrl: data.image_url || '',
  enrolledCourses: [],            // Ensure empty array initially
});


export const clerkWebhookHandler = async (req, res) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  const payload = req.body;
  const headers = req.headers;

  try {
    const wh = new Webhook(secret);
    const evt = wh.verify(payload, {
      'svix-id': headers['svix-id'],
      'svix-timestamp': headers['svix-timestamp'],
      'svix-signature': headers['svix-signature'],
    });

    console.log(' Clerk webhook hit received');

    const { data, type } = evt;

    switch (type) {
      case 'user.created': {
        const userData = formatUserData(data);

        //  Agar user exist nahi hai to create karo
        const existingUser = await User.findById(data.id);
        if (!existingUser) {
          await User.create(userData);
          console.log(' User created via webhook:', userData);
        } else {
          console.log('ℹUser already exists, skipping creation');
        }
        break;
      }

      case 'user.updated': {
        const userData = formatUserData(data);
        await User.findByIdAndUpdate(data.id, userData, { new: true, upsert: true });
        console.log(' User updated via webhook:', userData);
        break;
      }

      case 'user.deleted': {
        await User.findByIdAndDelete(data.id);
        console.log(' User deleted via webhook:', data.id);
        break;
      }

      default:
        console.log('ℹUnhandled webhook type:', type);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(' Webhook Error:', err.message);
    return res.status(400).json({ error: 'Invalid webhook' });
  }
};



const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(' Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Signature verified, handle event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        const { purchaseId } = session.data[0].metadata;

        const purchaseData = await Purchase.findById(purchaseId);
        const userData = await User.findById(purchaseData.userId);
        const courseData = await Course.findById(purchaseData.courseId.toString());

        // Avoid duplicate pushes
        if (!courseData.enrolledStudents.includes(userData._id)) {
          courseData.enrolledStudents.push(userData._id);
        }
        if (!userData.enrolledCourses.includes(courseData._id)) {
          userData.enrolledCourses.push(courseData._id);
        }

        await courseData.save();
        await userData.save();

        purchaseData.status = 'completed';
        await purchaseData.save();

        console.log(' PaymentIntent succeeded:', paymentIntentId);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        const { purchaseId } = session.data[0].metadata;
        const purchaseData = await Purchase.findById(purchaseId);
        purchaseData.status = 'failed';
        await purchaseData.save();

        console.log(' Payment failed:', paymentIntentId);
        break;
      }

      default:
        console.log(`ℹ Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(' Error handling webhook event:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
