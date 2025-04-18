import mongoose from "mongoose";

// Define the user schema
const userSchema = new mongoose.Schema(
    {
        _id: {
            type: String,  // You can change this to ObjectId if needed
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address'],
        },
        imageUrl: {
            type: String,
            required: true,
        },
        enrolledCourses: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',  // Reference to the 'Course' model
            required: false, // If courses are optional, keep it as false
        }],
    },
    { timestamps: true }
);

// Create the model
const User = mongoose.model('User', userSchema);

export default User;
