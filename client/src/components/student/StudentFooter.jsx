import React from 'react';
import { assets } from '../../assets/assets';

export const StudentFooter = () => {
  return (
    <div className='bg-gray-700 text-white w-full mt-10'>
      student footer
      {/* Top Section */}
      <div className='flex flex-col md:flex-row items-start px-8 md:px-36 justify-between gap-10 md:gap-20 py-10 border-b border-white/30'>
        {/* Logo and Description */}
        <div className='flex flex-col items-start max-w-xs'>
          <img src={assets.logo_dark} alt="GreatLearn Logo" className='mb-4' />
          <p className='text-sm text-gray-400'>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error fuga magni quisquam nulla! 
            Tenetur asperiores illum corrupti cupiditate itaque maxime dolorem blanditiis esse! Assumenda delectus quia iusto id hic? Consequuntur.
          </p>
        </div>

        {/* Quick Links */}
        <div className='flex flex-col items-start'>
          <h3 className='text-lg font-semibold mb-4'>Quick Links</h3>
          <ul className='space-y-2'>
            <li><a href='/' className='text-gray-400 hover:text-white transition-colors duration-200'>Home</a></li>
            <li><a href='/about' className='text-gray-400 hover:text-white transition-colors duration-200'>About Us</a></li>
            <li><a href='/courses' className='text-gray-400 hover:text-white transition-colors duration-200'>Courses</a></li>
            <li><a href='/contact' className='text-gray-400 hover:text-white transition-colors duration-200'>Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className='flex flex-col items-start'>
          <h3 className='text-lg font-semibold mb-4'>Contact Us</h3>
          <ul className='text-gray-400 space-y-2'>
            <li>Email: support@greatlearn.com</li>
            <li>Phone: +91 8404827541</li>
            <li>Address: 226301 lucknow Uttar Pradesh Learning St, Placio City</li>
          </ul>
        </div>

        {/* Social Media Links */}
        <div className='flex flex-col items-start'>
          <h3 className='text-lg font-semibold mb-4'>Follow Us</h3>
          <div className='flex space-x-4'>
            <a href='https://facebook.com'  >
              <img src={assets.facebook_icon} alt="Facebook" className='w-36 hover:opacity-80 transition-opacity duration-200' />
            </a>
            <a href='https://twitter.com' target='_blank' rel='noopener noreferrer'>
              <img src={assets.twitter_icon} alt="Twitter" className='w-36 hover:opacity-80 transition-opacity duration-200' />
            </a>
            <a href='https://instagram.com' target='_blank' rel='noopener noreferrer'>
              <img src={assets.instagram_icon} alt="Instagram" className='w-36 hover:opacity-80 transition-opacity duration-200' />
            </a>
            <a href='https://linkedin.com' target='_blank' rel='noopener noreferrer'>
              <img src={assets.linkedin} alt="LinkedIn" className='w-20 hover:opacity-80 transition-opacity duration-200' />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className='text-center py-6 text-gray-400'>
        <p>Copyright &copy; 2025 @ GreatLearn. All Rights Reserved.</p>
      </div>
    </div>

  );
};

export default StudentFooter;