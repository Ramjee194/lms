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

  const { getToken } = useAuth();
  const { user } = useUser();

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);

  // ✅ Backend URL WITHOUT trailing slash
  const backendUrl = "https://lms-1-ki76.onrender.com";

  // ================================
  // 1️⃣ Fetch All Courses
  // ================================
  const fetchAllCourses = async () => {
    
    try {
      const res = await fetch(`${backendUrl}/api/course/all`, {
        method: "GET",
        credentials: "include", // Required for Clerk sessions
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const data = await res.json();
      console.log(" All Courses from backend:", data);

      if (data.success) {
        setAllCourses(data.courses);
      } else {
        toast.error(`Backend responded with error: ${data.message}`);
        setAllCourses(dummyCourses);
      }
    } catch (err) {
      console.error("API Error:", err);
      toast.error(`API Error: ${err.message}`);
      setAllCourses(dummyCourses);
    }
  };

  // ================================
  // 2️⃣ Fetch User Data
  // ================================
  const fetchUserData = async () => {
    if (user?.publicMetadata?.role === "educator") {
      setIsEducator(true);
    }
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (data.success) {
        setUserData(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Fetch user data error:", error);
    }
  };

  // ================================
  // 3️⃣ Fetch User Enrolled Courses
  // ================================
  const fetchUserEnrolledCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/user/enrolled-courses`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (data.success) {
        setEnrolledCourses(data.enrolledCourses.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ================================
  // 4️⃣ Helper Functions
  // ================================
  const calculateRating = (course) => {
    if (!course.courseRating || course.courseRating.length === 0) return 0;

    const total = course.courseRating.reduce(
      (sum, r) => sum + r.rating,
      0
    );
    return Math.floor(total / course.courseRating.length);
  };

  const calculateChapterTime = (chapter) => {
    const time = chapter.chapterContent.reduce(
      (sum, lecture) => sum + lecture.lectureDuration,
      0
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.forEach((chapter) =>
      chapter.chapterContent.forEach(
        (lecture) => (time += lecture.lectureDuration)
      )
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateNoOfLecture = (course) => {
    if (!course || !course.courseContent) return 0;

    return course.courseContent.reduce((count, chapter) => {
      if (Array.isArray(chapter.chapterContent)) {
        return count + chapter.chapterContent.length;
      }
      return count;
    }, 0);
  };

  // ================================
  // 5️⃣ useEffect Hooks
  // ================================
  useEffect(() => {
     console.log("⏳ useEffect triggered for fetchAllCourses");
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchUserEnrolledCourses();
    }
  }, [user]);

  // ================================
  // 6️⃣ Context Value
  // ================================
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
    fetchUserEnrolledCourses,
    backendUrl,
    userData,
    setUserData,
    getToken,
    fetchAllCourses,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
