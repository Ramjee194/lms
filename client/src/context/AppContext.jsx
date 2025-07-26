import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const { getToken } = useAuth();
  const { user } = useUser();

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState([null])

  // ✅ Fixed: Fetch All Courses with Vite proxy
  const fetchAllCourses = async () => {
    try {
      const res = await fetch(backendUrl+'/api/course/all'); // 🟢 Use proxy URL
      const data = await res.json();

      console.log(" All Courses from backend:", data); // 🧪 Debug log

      if (data.success) {
        setAllCourses(data.courses);
      } else {
        toast.error(" Backend responded with error:", data.message);
        setAllCourses(dummyCourses); // optional fallback
      }
    } catch (err) {
      toast.error(" API Error:", err.message);
      setAllCourses(dummyCourses); // optional fallback
    }
  };

  //fetch userData
  const fetchUserData = async (req, res) => {
    if (user.publicMetadata.role === 'educator') {
      setIsEducator(true)
    }
    try {
      const token = await getToken();
      const { data } = await axios.get(backendUrl + 'api/user/data', { headers: { Authorization: `Bearer $(token)` } })
      if (data.success) {
        setUserData(data.user)
      }
      else {
        toast.error(data.message)
      }
    } catch (error) {

    }
  }


  const calculateRating = (course) => {
    if (!course.courseRating || course.courseRating.length === 0) {
      return 0;
    }
    let totalRating = 0;
    course.courseRating.forEach((rating) => {
      totalRating += rating.rating;
    });
    return Math.floor(totalRating / course.courseRating.length)
  };

  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.forEach((lecture) => (time += lecture.lectureDuration));
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.forEach((chapter) =>
      chapter.chapterContent.forEach((lecture) => (time += lecture.lectureDuration))
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateNoOfLecture = (course) => {
    if (!course || !course.courseContent) return 0;

    let totalLectures = 0;

    course.courseContent.forEach((chapter) => {
      if (chapter.chapterContent && Array.isArray(chapter.chapterContent)) {
        totalLectures += chapter.chapterContent.length;
      }
    });

    return totalLectures;
  };
  //fetch user enrolled course
  const fetchUserEnrolledCourses = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses', { headers: { Authorization: `Bearer $(token)` } })
      if (data.success) {
        setEnrolledCourses(data.enrolledCourses.reverse())
      }
      else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  };

  useEffect(() => {
    fetchAllCourses();

  }, []);



  useEffect(() => {
    if (user) {

      fetchUserData()
      fetchUserEnrolledCourses();
    }
  }, [user]);

  const value = {
    currency,
    allCourses,
    navigate,
    calculateRating,
    isEducator,
    setIsEducator,
    calculateNoOfLecture,
    calculateCourseDuration,
    calculateChapterTime,
    enrolledCourses,
    fetchUserEnrolledCourses, backendUrl, userData, setUserData, getToken, fetchAllCourses,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
