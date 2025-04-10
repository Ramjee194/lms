import { Webhook } from "svix";
import User from "../models/User.js";

// Format user data from Clerk
const formatUserData = (data) => ({
    _id: data.id, // Make sure your Mongoose schema uses String for _id
    email: data.email_addresses?.[0]?.email_address || "",
    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
    imageUrl: data.image_url || "",
});

export const clerlWebhooks = async (req, res) => {
    try {
        // Log incoming request
        console.log("🔔 Incoming Clerk webhook:");
        console.log("Headers:", req.headers);
        console.log("Body:", req.body);

        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        // Verify webhook signature
        const evt = whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        });

        const { data, type } = req.body;

        if (!data || !data.id) {
            console.warn("⚠️ Webhook missing user data or ID");
            return res.status(400).json({ success: false, message: "Missing data or user ID." });
        }

        const userData = formatUserData(data);
        console.log(`📄 Webhook type received: ${type}`);
        console.log("User data:", userData);

        switch (type) {
            case 'user.created':
                try {
                    await User.create(userData);
                    console.log("✅ User created");
                    return res.status(201).json({ success: true, message: "User created successfully" });
                } catch (err) {
                    console.error("❌ Error creating user:", err.message);
                    return res.status(500).json({ success: false, message: "Error creating user", error: err.message });
                }

            case 'user.updated':
                try {
                    await User.findByIdAndUpdate(data.id, userData, { new: true, upsert: true });
                    console.log("✅ User updated");
                    return res.status(200).json({ success: true, message: "User updated successfully" });
                } catch (err) {
                    console.error("❌ Error updating user:", err.message);
                    return res.status(500).json({ success: false, message: "Error updating user", error: err.message });
                }

            case 'user.deleted':
                try {
                    await User.findByIdAndDelete(data.id);
                    console.log("✅ User deleted");
                    return res.status(200).json({ success: true, message: "User deleted successfully" });
                } catch (err) {
                    console.error("❌ Error deleting user:", err.message);
                    return res.status(500).json({ success: false, message: "Error deleting user", error: err.message });
                }

            default:
                console.warn("⚠️ Unknown webhook type:", type);
                return res.status(400).json({ success: false, message: `Unknown webhook type: ${type}` });
        }

    } catch (error) {
        console.error("❌ Webhook processing error:", error);
        return res.status(500).json({ success: false, message: "Internal server error", details: error.message });
    }
};
