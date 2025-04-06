import React, { useContext } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import { AppContext } from '../../context/AppContext';
import CourseCard from './CourseCard';

const CourseSection = () => {
  const { allCourses } = useContext(AppContext);

  return (
    <div className='py-16 px-4 md:px-8 lg:px-16 xl:px-40'>
      <h2 className='text-3xl font-medium text-gray-800'>Learn from the best</h2>
      <p className='text-sm md:text-base text-gray-500 mt-3'>
        Discover our top-rated courses across various categories. From coding
        design to business and wellness,<br /> our courses are crafted to deliver results.
      </p>

      {/* Course Cards Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-14'>
        {allCourses.slice(0, 4).map((course, index) => (
          <CourseCard key={index} course={course} />
        ))}
      </div>

      {/* Show All Courses Button */}
      <div className='flex justify-center mt-16'> {/* Adjusted margin-top to mt-16 */}
        <Link
          to={'/course-list'}
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top
          }}
          className='text-gray-500 border border-gray-500/30 px-10 py-3 rounded hover:bg-gray-50 transition-colors duration-200' // Added hover effect
        >
          Show all courses
        </Link>
      </div>
    </div>
  );
};

export default CourseSection;