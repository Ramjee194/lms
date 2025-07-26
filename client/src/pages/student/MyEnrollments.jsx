import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { Line } from 'rc-progress';
import Footer from '../../components/student/StudentFooter';

const MyEnrollments = () => {
  const { enrolledCourses, calculateCourseDuration, navigate } = useContext(AppContext);

  const [progressArray, setProgressArray] = useState([
    { lectureCompleted: 2, totalLectures: 4 },
    { lectureCompleted: 2, totalLectures: 4 },
    { lectureCompleted: 4, totalLectures: 4 },
    { lectureCompleted: 2, totalLectures: 4 },
    { lectureCompleted: 0, totalLectures: 6 },
    { lectureCompleted: 6, totalLectures: 6 },
    { lectureCompleted: 2, totalLectures: 4 },
    { lectureCompleted: 2, totalLectures: 8 },
    { lectureCompleted: 2, totalLectures: 4 },
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Enrollments</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-3 font-semibold text-left truncate">Course</th>
            <th className="px-4 py-3 font-semibold text-left truncate">Duration</th>
            <th className="px-4 py-3 font-semibold text-left truncate">Completed</th>
            <th className="px-4 py-3 font-semibold text-left truncate">Status</th>
          </tr>
        </thead>
        <tbody className="text-gray-700 ">
          {enrolledCourses.map((course, index) => (
            <tr key={index} className="border-b border-gray-500/20">
              <td className="md:px-4 pl-2 md:pl-4 py-4 flex items-center space-x-3">
                <img
                  src={course.courseThumbnail}
                  alt={course.courseTitle}
                  className="w-14 sm:w-24 md:w-28 rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 mb-1">{course.courseTitle}</p>
                  <div className="flex items-center gap-2">
                    <Line
                      strokeWidth={2} // Increased stroke width for a thicker progress bar
                      strokeColor="#3B82F6" // Blue color for the progress bar
                      trailWidth={4} // Thickness of the background line
                      trailColor="#E5E7EB" // Light gray color for the background line
                      percent={
                        progressArray[index]
                          ? (progressArray[index].lectureCompleted * 100) / progressArray[index].totalLectures
                          : 0
                      }
                      className="w-full" // Make the progress bar take full width
                    />
                    <span className="text-sm text-gray-700">
                      {progressArray[index]
                        ? `${Math.round(
                            (progressArray[index].lectureCompleted * 100) / progressArray[index].totalLectures
                          )}%`
                        : '0%'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{course.instructor}</p>
                </div>
              </td>
              <td className="px-4 py-3 truncate">
                {calculateCourseDuration(course)}
              </td>
              <td className="px-4 py-3 truncate">
                {progressArray[index] &&
                  `${progressArray[index].lectureCompleted} / ${progressArray[index].totalLectures} Lectures`}
              </td>
              <td className="px-4 py-3 truncate">
                <button
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    progressArray[index] &&
                    progressArray[index].lectureCompleted / progressArray[index].totalLectures === 1
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                  onClick={() => navigate('/player/' + course._id)}
                >
                  {progressArray[index] &&
                  progressArray[index].lectureCompleted / progressArray[index].totalLectures === 1
                    ? 'Completed'
                    : 'On Going'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Footer/>
    </div>
     
  );
  
 
};


export default MyEnrollments;