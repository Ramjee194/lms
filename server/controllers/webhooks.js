export const clerlWebhooks = async (req, res) => {
    try {
        console.log('Received Webhook headers:', req.headers);  // Log headers to check

        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        // Verify the webhook using the headers from the request
        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        });

        const { data, type } = req.body;

        if (!data || !data.id) {
            return res.status(400).json({ success: false, message: "Missing data or user ID." });
        }

        switch (type) {
            case 'user.created': {
                const userData = formatUserData(data);
                await User.create(userData);
                return res.status(201).json({ success: true, message: "User created successfully" });
            }
            case 'user.updated': {
                const userData = formatUserData(data);
                await User.findByIdAndUpdate(data.id, userData);
                return res.status(200).json({ success: true, message: "User updated successfully" });
            }
            case 'user.deleted': {
                await User.findByIdAndDelete(data.id);
                return res.status(200).json({ success: true, message: "User deleted successfully" });
            }
            default: {
                return res.status(400).json({ success: false, message: `Unknown webhook type: ${type}` });
            }
        }
    } catch (error) {
        console.error("Webhook processing error:", error);
        return res.status(500).json({ success: false, message: "Internal server error", details: error.message });
    }
};
