import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import supabase from '../supabaseClient';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
    window.location.href = "/";
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        try {
          const response = await fetch(`http://localhost:5000/api/auth/profile/${user.id}`);
          const result = await response.json();
          if (result.success) {

            // যদি tutor হয় তাহলে tutor profile থেকে image নিন
            if (result.profile.role === 'tutor') {
              const tutorResponse = await fetch(`http://localhost:5000/api/tutors/my-profile/${user.id}`);
              const tutorResult = await tutorResponse.json();
              if (tutorResult.success && tutorResult.tutorProfile?.profile_picture_url) {
                setProfilePicture(tutorResult.tutorProfile.profile_picture_url);
              }
            } else {
              setProfilePicture(result.profile.profile_picture_url);
            }
          }
        } catch (error) {
          console.error('Profile fetch error:', error);
        }
      }

    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        setProfilePicture(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const isProfile = location.pathname === '/dashboard';

  return (
    <nav className="bg-[#FBFDF7] border-b border-gray-200 shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex flex-col leading-tight">
          <a href='/' className="text-3xl font-bold text-[#70B44A]">TutorVerse</a>
          <span className="text-xs text-gray-500 -mt-1 ml-2">Your trusted tutor partner</span>
        </div>

        <div className="sm:hidden">
          <button onClick={toggleMenu} className="text-black text-2xl focus:outline-none">
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <ul className="hidden sm:flex space-x-6 font-semibold text-sm text-black items-center">
          <li><a href="/" className={`hover:text-[#70B44A] ${location.pathname === '/' ? `text-[#70B44A]` : ''}`}>Home</a></li>
          <li><a href="/all-tutors" className={`hover:text-[#70B44A] ${location.pathname === '/all-tutors' ? `text-[#70B44A]` : ''}`}>Tutors</a></li>
          <li><a href="/all-posts" className={`hover:text-[#70B44A] ${location.pathname === '/all-posts' ? `text-[#70B44A]` : ''}`}>Tuitions</a></li>
          <li><a href="/service" className={`hover:text-[#70B44A] ${location.pathname === '/service' ? `text-[#70B44A]` : ''}`}>Services</a></li>

          {user && !isProfile ? (
            <li>
              <a href="/dashboard">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-[#70B44A]"
                  />
                ) : (
                  <FaUserCircle className="w-8 h-8 rounded-full object-cover text-[#70B44A]" />
                )}
              </a>
            </li>
          ) : (
            <></>
          )}
        </ul>
      </div>

      {/* Mobile menu e logout button add korlam */}
      {isOpen && (
        <ul className="sm:hidden px-4 pb-4 space-y-2 font-medium text-sm text-black">
          <li><a href="/" className="block hover:text-[#70B44A]">Home</a></li>
          <li><a href="/all-tutors" className="block hover:text-[#70B44A]">Tutors</a></li>
          <li><a href="/all-posts" className="block hover:text-[#70B44A]">Tuitions</a></li>
          <li><a href="/service" className="block hover:text-[#70B44A]">Services</a></li>

          {user && (
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 w-full"
              >
                <FaSignOutAlt className="text-lg" />
                <span>Log out</span>
              </button>
            </li>
          )}
        </ul>
      )}
    </nav>
  );
};

export default Navbar;