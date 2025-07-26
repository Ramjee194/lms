import { clerkClient } from "@clerk/express";
import Course from "../models/Course.js";
import cloudinary from "../configs/cloudinary.js";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js"; // Assuming you have a User model

// ✅ 1. Update user role to educator
export const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req.auth.userId;

    // Update Clerk metadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'educator',
      },
    });

    // Fetch updated user info (optional)
    const user = await clerkClient.users.getUser(userId);

    res.json({
      success: true,
      message: 'You can now publish courses!',
      user, // ✅ Include user so frontend has the latest
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ 2. Add a new course
export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.json({ success: false, message: 'Thumbnail not attached' });
    }

    const parsedCourseData = JSON.parse(courseData);
    parsedCourseData.educator = req.auth.userId;

    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
    parsedCourseData.courseThumbnail = imageUpload.secure_url;

    const newCourse = await Course.create(parsedCourseData);

    res.json({ success: true, message: 'Course added successfully', course: newCourse });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ 3. Get all courses by educator
export const getEducatorCourses = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });

    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ 4. Educator dashboard data
export const educatorDashboardData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    const totalCourses = courses.length;
    const courseIds = courses.map(course => course._id);

    // Calculate total earnings from completed purchases
    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: 'completed',
    });

    const totalEarnings = purchases.reduce((sum, p) => sum + p.amount, 0);

    // Collect enrolled student data with course title
    const enrolledStudentsData = [];

    for (const course of courses) {
      const students = await User.find(
        { _id: { $in: course.enrolledStudent } },
        'name imageUrl'
      );

      students.forEach(student => {
        enrolledStudentsData.push({
          courseTitle: course.courseTitle,
          studentName: student.name,
          studentImage: student.imageUrl,
        });
      });
    }

    res.json({
      success: true,
      dashboardData: {
        totalCourses,
        totalEarnings,
        enrolledStudentsData,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ 5. Get enrolled students with purchase data
export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    const courseIds = courses.map(course => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: 'completed',
    })
      .populate('userId', 'name imageUrl')
      .populate('courseId', 'courseTitle');

    const enrolledStudents = purchases.map(purchase => ({
      studentName: purchase.userId.name,
      studentImage: purchase.userId.imageUrl,
      courseTitle: purchase.courseId.courseTitle,
      purchaseDate: purchase.createdAt,
    }));

    res.json({ success: true, enrolledStudents });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
