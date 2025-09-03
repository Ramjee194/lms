import User from "../models/User.js"
import { Purchase } from "../models/Purchase.js"
import Stripe from "stripe"



import Course from "../models/Course.js"
import CourseProgress from "../models/CourseProgress.js"

export const getUserData = async (req, res) => {
  try {
    const userId = req.auth.userId
    const user = await User.findById(userId)

    if (!user) {
      return res.json({ success: false, message: 'User not found' })
    }
    res.json({ success: true, user })

  } catch (error) {
    res.json({ success: false, message: error.message })


  }
}

//user enrolled courses with lecture links

export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth.userId
    const userData = await User.findById(userId).populate('enrolledCourses')
    res.json({ success: true, enrolledCourses: userData.enrolledCourses })

  } catch (error) {
    res.json({ success: false, message: error.message })

  }
}

export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.auth?.userId; // middleware se aayega

    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData || !courseData) {
      console.log("ERROR: userData or courseData not found");
      return res.json({ success: false, message: 'Data not found' });
    }

    // Already enrolled check
    if (courseData.enrolledStudents.some(id => id.toString() === userData._id.toString())) {
      return res.json({ success: false, message: "Already enrolled" });
    }

    const amount = Math.round(
      (courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100) * 100
    );

    // Create purchase record
    const newPurchase = await Purchase.create({
      courseId: courseData._id,
      userId,
      amount: amount / 100,
      isPaid: true, // assume payment done
    });

    // Update enrolledStudents
    courseData.enrolledStudents.push(userData._id);
    await courseData.save();

    res.json({
      success: true,
      courseId: courseData._id.toString(),
      purchaseId: newPurchase._id.toString(),
    });
  } catch (err) {
    console.error("Purchase error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};




export const markLectureComplete = async (req, res) => {
  const { userId } = req;
  const { courseId, lectureId } = req.body;

  try {
    const userId = req.auth.userId
    let progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      progress = await CourseProgress.create({
        userId,
        courseId,
        completedLectures: [lectureId],
      });
    } else {
      if (!progress.completedLectures.includes(lectureId)) {
        progress.completedLectures.push(lectureId);
        progress.lastAccessed = Date.now();
        await progress.save();
      }
    }

    res.status(200).json({ success: true, progress });
  } catch (err) {
    console.error("Error updating course progress", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getCourseProgress = async (req, res) => {
  const { userId } = req;
  const { courseId } = req.params;

  try {
    const progress = await CourseProgress.findOne({ userId, courseId }).populate("completedLectures");
    res.status(200).json({ success: true, progress });
  } catch (err) {
    console.error("Error fetching course progress", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};