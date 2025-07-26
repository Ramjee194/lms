import User from "../models/User.js"
import { Purchase } from "../models/Purchase.js"
import Stripe from "stripe"



import Course from "../models/Course.js"
import CourseProgress from "../models/CourseProgress.js"

export const getUserData = async (req,res)=>{
    try{
        const userId=req.auth.userId
        const user= await User.findById(userId)

        if(!user){
            return res.json({success:false,message:'User not found'})
        }
        res.json({success:true,user})

    }catch(error){
        res.json({success:false,message:error.message})


    }
}

//user enrolled courses with lecture links

export const userEnrolledCourses = async(req,res)=>{
    try{
        const userId =req.auth.userId
        const userData =await User.findById(userId).populate('enrolledCourses')
        res.json({success:true,enrolledCourses:userData.enrolledCourses})

    }catch(error){
        res.json({success:false,message:error.message})

    }
}

export const purchaseCourse = async (req,res)=>{
    try{
        const {courseId} = req.body
        const {origin} = req.headers
        const userId=req.auth.userId
        const userData = await User.findById(userId)
        const courseData = await Course.findById(courseId)

        if(!userData||courseData){
            return res.json({success:false,message:'Data not found'})
        }
        const purchaseData ={
            courseId:courseData._id,
            userId,
            amount:(courseData.coursePrice-courseData.discount*courseData.coursePrice/100).toFixed(2),
        }
        const newPurchase = await Purchase.create(purchaseData)

        //stripe Gatway initialize

        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
         const currency = process.env.CURRENCY.toLowerCase()

         //creatring line item   for stripe
         const line_items = [{
            price_data:{
                currency,product_data:{
                    name:courseData.courseTitle
                },
                unit_amount:Math.floor(newPurchase.amount)*100
            },
            quantity:1
         }]

         const session = await stripeInstance.checkout.sessions.create({
            success_url:`${origin}/loading/my-enrollments`,
            cancel_url:`${origin}/`,
            line_items:line_items,
            mode:'payment',
            metadata:{
                purchaseId:newPurchase._id.toString()
            }
         })
         res.json({success:true,session_url:session.url})

        

    }catch(error){
        res.json({success:false,message:error.message});

    }
}





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