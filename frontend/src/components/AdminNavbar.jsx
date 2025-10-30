import React, { useState } from 'react';
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';
import supabase from '../supabaseClient';

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    window.location.href = '/';
  };

  return (
    <nav className="bg-[#FBFDF7] border-b border-gray-200 shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex flex-col leading-tight">
          <a href='/admin' className="text-3xl font-bold text-[#70B44A]">TutorVerse</a>
          <span className="text-xs text-gray-500 -mt-1 ml-2">Your trusted tutor partner</span>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="sm:hidden">
          <button onClick={toggleMenu} className="text-black text-2xl focus:outline-none">
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden sm:flex space-x-6 font-semibold text-sm text-black items-center">
          <li>
            <a href="/admin" className="hover:text-[#70B44A]">
              Home
            </a>
          </li>          <li>
            <a href="/tutors-verification" className="hover:text-[#70B44A]">
              Tutors
            </a>
          </li>          <li>
            <a href="/users-management" className="hover:text-[#70B44A]">
              Users
            </a>
          </li>          <li>
            <a href="/posts-management" className="hover:text-[#70B44A]">
              Posts
            </a>
          </li>
              
              <li>
                <button
                  onClick={handleLogout}
                  className="border border-red-400 text-red-700 font-normal px-4 py-1 rounded-md hover:cursor-pointer"
                >
                  Logout
                </button>
              </li>
        </ul>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="sm:hidden px-4 pb-4 space-y-3 font-medium text-sm text-black">
          <li>
            <a href="/admin" className="hover:text-[#70B44A]">
              Home
            </a>
          </li>          <li>
            <a href="/tutors-verification" className="hover:text-[#70B44A]">
              Tutors
            </a>
          </li>          <li>
            <a href="/users-management" className="hover:text-[#70B44A]">
              Users
            </a>
          </li>          <li>
            <a href="/posts-management" className="hover:text-[#70B44A]">
              Posts
            </a>
          </li>
              
              <li>
                <button
                  onClick={handleLogout}
                  className="border border-red-500 text-red-500 px-4 py-1 rounded-md hover:bg-red-500 hover:text-white transition"
                >
                  Logout
                </button>
              </li>
        </ul>
      )}
    </nav>
  );
};

export default AdminNavbar;