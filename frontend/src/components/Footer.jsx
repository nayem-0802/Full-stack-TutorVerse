import React from 'react';
import { TfiEmail } from "react-icons/tfi";
import { IoMdCall } from "react-icons/io";


const Footer = () => {
  return (
    <footer className="bg-[#FBFDF7] border-t border-gray-200 px-4 py-6 text-sm text-gray-600">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
        
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-semibold text-black">TutorVerse</h3>
          <p className="text-sm text-gray-500 mt-1">
            Designed and Developed by<br />Team Trinity.
          </p>
        </div>

        <div className="text-center sm:text-left">
          <h4 className="text-sm font-medium text-black mb-1">Contact us</h4>
          <p className="flex justify-center sm:justify-start items-center gap-1 text-sm "><IoMdCall />01764739459</p>
          <p className="flex items-center gap-1 text-sm "><TfiEmail/>tutorverse@gmail.com</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
