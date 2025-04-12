import { Webhook } from "svix";
import User from "../models/User.js";

const formatUserData = (data) => ({
    _id: data.id,
    email: data.email_addresses[0].email_address,
    name: `${data.first_name} ${data.last_name}`,
    imageUrl: data.image_url,
});

export const clerkWebhooks = async (req, res) => {
    try {
        // Check for required headers first
        const svixId = req.headers['svix-id'];
        const svixTimestamp = req.headers['svix-timestamp'];
        const svixSignature = req.headers['svix-signature'];
        
        if (!svixId || !svixTimestamp || !svixSignature) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required Svix headers" 
            });
        }

        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        
        // Get raw body if using body-parser
        let body;
        try {
            body = JSON.stringify(req.body);
        } catch (err) {
            return res.status(400).json({ 
                success: false, 
                message: "Error parsing request body" 
            });
        }

        try {
            await whook.verify(body, {
                "svix-id": svixId,
                "svix-timestamp": svixTimestamp,
                "svix-signature": svixSignature,
            });
        } catch (err) {
            console.error("Webhook verification failed:", err);
            return res.status(400).json({ 
                success: false, 
                message: "Webhook verification failed",
                error: err.message 
            });
        }

        const { data, type } = req.body;

        if (!data || !data.id) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing data or user ID." 
            });
        }

        switch (type) {
            case 'user.created': {
                const userData = formatUserData(data);
                await User.create(userData);
                return res.status(201).json({ 
                    success: true, 
                    message: "User created successfully" 
                });
            }
            case 'user.updated': {
                const userData = formatUserData(data);
                await User.findByIdAndUpdate(data.id, userData);
                return res.status(200).json({ 
                    success: true, 
                    message: "User updated successfully" 
                });
            }
            case 'user.deleted': {
                await User.findByIdAndDelete(data.id);
                return res.status(200).json({ 
                    success: true, 
                    message: "User deleted successfully" 
                });
            }
            default: {
                return res.status(400).json({ 
                    success: false, 
                    message: `Unknown webhook type: ${type}` 
                });
            }
        }
    } catch (error) {
        console.error("Webhook processing error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error",
            details: error.message 
        });
    }
};