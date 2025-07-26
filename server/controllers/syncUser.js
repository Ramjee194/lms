import { getAuth } from "@clerk/express";  // Clerk session to get current user ID
import User from "../models/User.js";  // MongoDB User model
import axios from "axios";  // To fetch data from Clerk API

export const syncUser = async (req, res) => {
  try {
    const { userId, getToken } = getAuth(req);  // Get the logged-in userId

    console.log("Received userId from Clerk:", userId);  // Debug log

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized - No user ID" });
    }

    // Get the token from Clerk session
    const token = await getToken();
    console.log("Received token:", token);  // Debug log

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized - No token" });
    }

    // Proceed with the Clerk API request
    const clerkRes = await axios.get(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = clerkRes.data;

    // Format and update the user in MongoDB
    const userData = {
      _id: data.id,
      email: data.email_addresses[0]?.email_address || "",
      name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      imageUrl: data.image_url || "",
    };

    const user = await User.findByIdAndUpdate(data.id, userData, { upsert: true, new: true });
    return res.status(200).json({ success: true, user });

  } catch (error) {
    console.error("syncUser error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};
