import express from 'express'

import { getCourseProgress, getUserData,markLectureComplete,purchaseCourse,userEnrolledCourses, } from '../controllers/userController.js'
import { getAverageRating, rateCourse } from '../models/CourseProgress.js'
import { requireAuth } from '@clerk/express'


const userRouter = express.Router()

userRouter.get('/data',getUserData)
userRouter.get('/enrolled-courses',userEnrolledCourses)
userRouter.post('/purchase',requireAuth,purchaseCourse)
userRouter.post("/mark-complete", requireAuth, markLectureComplete);
userRouter.get("/:courseId", requireAuth, getCourseProgress);
userRouter.post("/rate", requireAuth, rateCourse);
userRouter.get("/average/:courseId", getAverageRating);



export default userRouter;