import * as Clerk from "@clerk/clerk-sdk-node";
import User from "../models/User.js";

const formatUserData = (data) => ({
  _id: data.id,
  email: data.email_addresses?.[0]?.email_address || "",
  name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
  imageUrl: data.image_url || ""
});

 const syncUser = async (req, res) => {
  try {
    const { userId } = Clerk.getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
      }
    });

    const userDataRaw = await response.json();
    const userData = formatUserData(userDataRaw);

    const user = await User.findByIdAndUpdate(userData._id, userData, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Error syncing user:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export { syncUser, };
