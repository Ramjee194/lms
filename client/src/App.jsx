import React from 'react';
import { Route, Routes, useMatch } from 'react-router-dom';
import Home from './pages/student/Home';
import CoursesList from './pages/student/CoursesList';
import CourseDetails from './pages/student/CourseDetails';
import MyEnrollments from './pages/student/MyEnrollments';
import Player from './pages/student/Player';
import Loading from './components/student/Loading';
import Educator from './pages/educator/Educator';
import Dashboard from './pages/educator/Dashboard';
import MyCourses from './pages/educator/MyCourses';
import AddCourse from './pages/educator/AddCourse';
import StudentEnrolled from './pages/educator/StudentEnrolled';
import Navbar from './components/student/Navbar';
import "quill/dist/quill.snow.css";
 import { ToastContainer } from 'react-toastify';

import CreateCourse from './pages/educator/CreateCourse';



const App = () => {

  const isEducatorRoute=useMatch('/educator/*')

  return (
    <div className='text-default min-h-screen bg-white'>
       <ToastContainer />
      
      {!isEducatorRoute &&  <Navbar/>}
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/Course-list' element={<CoursesList/>}/>
        <Route path='/Course-list/:input' element={<CoursesList/>}/>
        <Route path='/course/:id' element={<CourseDetails/>}/>
        <Route path='/my-enrollments' element={<MyEnrollments/>}/>
        <Route path='/player/:courseId' element={<Player/>}/>
        <Route path='/loading/:path' element={<Loading/>}/>
        
        
        {/* Nested Routes for Educator */}
        <Route path='/educator' element={<Educator/>}>
          <Route path='/educator' element={<Dashboard/>}/>
          <Route path='add-course' element={<AddCourse/>}/>
          <Route path='my-courses' element={<MyCourses/>}/>
          <Route path='student-enrolled' element={<StudentEnrolled/>}/>
          <Route path="courses" element={<MyCourses />} />
          <Route path="courses/new" element={<CreateCourse />} />
          <Route path="courses/:id/edit" element={<CreateCourse />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;