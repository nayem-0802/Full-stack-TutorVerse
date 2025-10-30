import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';
import supabase from '../supabaseClient';
import { FaUser, FaGraduationCap, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const TutorProfilePage = () => {
  const navigate = useNavigate();
  const [tutorProfile, setTutorProfile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchTutorProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setError('Please login first');
          navigate('/login');
          return;
        }
        
        setUser(user);
        
        // Fetch basic user profile
        const profileResponse = await fetch(`http://localhost:5000/api/auth/profile/${user.id}`);
        const profileResult = await profileResponse.json();
        
        if (profileResult.success) {
          setUserProfile(profileResult.profile);
        }
        
        // Fetch tutor profile
        const tutorResponse = await fetch(`http://localhost:5000/api/tutors/my-profile/${user.id}`);
        const tutorResult = await tutorResponse.json();
        
        if (tutorResult.success) {
          setTutorProfile(tutorResult.tutorProfile);
        } else {
          setError('No tutor profile found. Please complete tutor registration first.');
        }
        
      } catch (error) {
        setError('Failed to load tutor profile');
        console.error('Tutor profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-20">
        <Navbar />
        <div className="flex flex-1">
          <SideBar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg">Loading your tutor profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tutorProfile) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-20">
        <Navbar />
        <div className="flex flex-1">
          <SideBar />
          <div className="flex-1 flex items-center justify-center flex-col">
            <p className="text-red-500 mb-4">{error || 'Tutor profile not found'}</p>
            <button
              onClick={() => navigate('/tutor-form')}
              className="bg-[#70B44A] text-white px-6 py-2 rounded-md hover:bg-[#5a983b] transition"
            >
              Complete Tutor Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pt-20 pb-20 md:ml-60">
      <Navbar />
      <div className="flex flex-1 flex-col md:flex-row">
        <SideBar />
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">

            {/* Profile Header - change FaUser icon and add image */}
            <div className="bg-[#FBFDF6] rounded-lg shadow-md p-6 border border-gray-200 mb-6">
              <div className="flex items-center gap-6">
                {/* Profile Picture */}
                {tutorProfile.profile_picture_url ? (
                  <img 
                    src={tutorProfile.profile_picture_url} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#70B44A]"
                  />
                ) : (
                  <FaUser className="text-6xl text-[#70B44A]" />
                )}
                
                <div>
                  <h1 className="text-3xl font-bold text-[#70B44A]">
                    {tutorProfile.first_name} {tutorProfile.last_name}
                  </h1>
                  <p className="text-gray-600 mt-1">{userProfile?.email}</p>
                  <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${
                    tutorProfile.verification_status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : tutorProfile.verification_status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tutorProfile.verification_status === 'approved' 
                      ? 'Verified Tutor' 
                      : tutorProfile.verification_status === 'pending'
                      ? 'Verification Pending'
                      : 'Verification Rejected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Academic Qualifications */}
            <div className="bg-[#FBFDF6] rounded-lg shadow-md p-6 border border-gray-200 mb-6">
              <h2 className="text-xl font-semibold text-[#70B44A] mb-4 flex items-center gap-2">
                <FaGraduationCap /> Academic Qualifications
              </h2>
              <div className="space-y-4">
                {/* SSC */}
                <div className="border-b border-gray-300 pb-3">
                  <p className="font-medium text-gray-800">SSC</p>
                  <div className="text-sm text-gray-600 mt-1">
                    <p>Result: {tutorProfile.ssc_result}</p>
                    {tutorProfile.ssc_department && (
                      <p>Department: {tutorProfile.ssc_department}</p>
                    )}
                  </div>
                </div>
                
                {/* HSC */}
                <div className="border-b border-gray-300 pb-3">
                  <p className="font-medium text-gray-800">HSC</p>
                  <div className="text-sm text-gray-600 mt-1">
                    <p>Result: {tutorProfile.hsc_result}</p>
                    {tutorProfile.hsc_department && (
                      <p>Department: {tutorProfile.hsc_department}</p>
                    )}
                  </div>
                </div>
                
                {/* Honours */}
                {tutorProfile.honours_result && (
                  <div className="border-b border-gray-300 pb-3">
                    <p className="font-medium text-gray-800">Honours</p>
                    <div className="text-sm text-gray-600 mt-1">
                      <p>Result: {tutorProfile.honours_result}</p>
                      <p>Institution: {tutorProfile.honours_institution}</p>
                      <p>Department: {tutorProfile.honours_department}</p>
                    </div>
                  </div>
                )}
                
                {/* Masters */}
                {tutorProfile.masters_result && (
                  <div className="pb-3">
                    <p className="font-medium text-gray-800">Masters</p>
                    <div className="text-sm text-gray-600 mt-1">
                      <p>Result: {tutorProfile.masters_result}</p>
                      <p>Institution: {tutorProfile.masters_institution}</p>
                      <p>Department: {tutorProfile.masters_department}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {tutorProfile.bio && (
              <div className="bg-[#FBFDF6] rounded-lg shadow-md p-6 border border-gray-200 mb-6">
                <h2 className="text-xl font-semibold text-[#70B44A] mb-3">About Me</h2>
                <p className="text-sm text-gray-700 whitespace-pre-line">{tutorProfile.bio}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-[#FBFDF6] rounded-lg shadow-md p-6 border border-gray-200 mb-6">
              <h2 className="text-xl font-semibold text-[#70B44A] mb-4">Contact Information</h2>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-medium">Email:</span> {userProfile?.email}</p>
                <p><span className="font-medium">Phone:</span> {userProfile?.phone}</p>
                <p><span className="font-medium">Address:</span> {userProfile?.address}</p>
              </div>
            </div>
            {/* Header with Edit Button */}
            <div className="flex justify-center items-center mb-6">
              <button
                onClick={() => navigate('/edit-tutor-profile')}
                className="flex items-center gap-2 border border-[#70B44A] text-black px-4 py-2 rounded-md hover:bg-[#f3fff1] transition"
              >
                <FaEdit /> Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfilePage;