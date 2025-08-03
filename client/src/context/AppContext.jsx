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

  // ✅ No trailing slash
  const backendUrl = "https://lms-1-ki76.onrender.com";

  // ==============================
  // 1️⃣ Fetch All Courses
  // ==============================
  const fetchAllCourses = async () => {
    console.log("📡 Calling fetchAllCourses...");
    try {
      const res = await fetch(`${backendUrl}/api/course/all`, {
        method: "GET",
        credentials: "include", // ✅ required for Clerk session
        headers: { "Content-Type": "application/json" },
      });

      console.log("📡 Response status:", res.status);

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const data = await res.json();
      console.log("✅ All Courses from backend:", data);

      if (data.success) {
        setAllCourses(data.courses);
      } else {
        toast.error(`Backend responded with error: ${data.message}`);
        setAllCourses(dummyCourses); // fallback
      }
    } catch (err) {
      console.error("❌ API Error:", err);
      toast.error(`API Error: ${err.message}`);
      setAllCourses(dummyCourses);
    }
  };

  // ==============================
  // 2️⃣ Fetch User Data
  // ==============================
  const fetchUserData = async () => {
    if (user?.publicMetadata?.role === "educator") setIsEducator(true);

    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (data.success) setUserData(data.user);
      else toast.error(data.message);
    } catch (error) {
      console.error("❌ FetchUserData Error:", error.message);
    }
  };

  // ==============================
  // 3️⃣ Fetch User Enrolled Courses
  // ==============================
  const fetchUserEnrolledCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/user/enrolled-courses`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (data.success) setEnrolledCourses(data.enrolledCourses.reverse());
      else toast.error(data.message);
    } catch (error) {
      console.error("❌ EnrolledCourses Error:", error.message);
    }
  };

  // ==============================
  // 4️⃣ Calculators
  // ==============================
  const calculateRating = (course) =>
    course?.courseRating?.length
      ? Math.floor(course.courseRating.reduce((sum, r) => sum + r.rating, 0) / course.courseRating.length)
      : 0;

  const calculateChapterTime = (chapter) =>
    humanizeDuration(
      (chapter?.chapterContent?.reduce((t, l) => t + l.lectureDuration, 0) || 0) * 60 * 1000,
      { units: ["h", "m"] }
    );

  const calculateCourseDuration = (course) =>
    humanizeDuration(
      (course?.courseContent?.reduce(
        (total, c) => total + c.chapterContent.reduce((t, l) => t + l.lectureDuration, 0),
        0
      ) || 0) * 60 * 1000,
      { units: ["h", "m"] }
    );

  const calculateNoOfLecture = (course) =>
    course?.courseContent?.reduce((total, c) => total + (c.chapterContent?.length || 0), 0) || 0;

  // ==============================
  // 5️⃣ Effects
  // ==============================
  useEffect(() => {
    console.log("⏳ useEffect triggered for fetchAllCourses");
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (user) {
      console.log("⏳ Fetching user-related data...");
      fetchUserData();
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
    fetchUserEnrolledCourses,
    backendUrl,
    userData,
    setUserData,
    getToken,
    fetchAllCourses,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
