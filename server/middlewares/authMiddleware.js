import { clerkClient } from "@clerk/express";

// Middleware to protect educator-only routes
export const protectEducator = async (req, res, next) => {
  try {
    const userId = req.auth?.userId; // Use optional chaining to avoid crashing if req.auth is undefined

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized - No user ID" });
    }

    const user = await clerkClient.users.getUser(userId);

    const role = user?.publicMetadata?.role;

    if (role !== 'educator') {
      return res.status(403).json({ success: false, message: 'Access denied - Educators only' });
    }

    next(); // User is an educator, proceed to the next middleware
  } catch (error) {
    console.error("protectEducator error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
