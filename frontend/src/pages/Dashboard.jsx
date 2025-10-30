import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import { FaUserCircle, FaGraduationCap, FaEdit } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tutorProfile, setTutorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          console.error("User fetch error:", error?.message);
          setLoading(false);
          return;
        }

        setUser(user);

        // Fetch basic profile
        const response = await fetch(`http://localhost:5000/api/auth/profile/${user.id}`);
        const result = await response.json();

        if (result.success) {
          setProfile(result.profile);

          // যদি tutor হয় তাহলে check করুন profile complete আছে কিনা
          if (result.profile.role === 'tutor') {
            const tutorResponse = await fetch(`http://localhost:5000/api/tutors/my-profile/${user.id}`);
            const tutorResult = await tutorResponse.json();

            if (!tutorResult.success) {
              // Tutor profile নেই, redirect to tutor form
              window.location.href = '/tutor-form';
              return;
            }

            setTutorProfile(tutorResult.tutorProfile);
          }
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-20">
        <Navbar />
        <div className="flex flex-1">
          <SideBar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pt-20 pb-20 md:pb-0 md:ml-60">
      <Navbar />
      <div className="flex flex-1 flex-col md:flex-row">
        <SideBar />

        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">

            {/* Basic Profile Section */}
            <div className="bg-[#FBFDF6] rounded-lg shadow-md p-6 border border-gray-200 mt-6 mb-6">
              <div className="flex flex-col items-center mb-6">
                {/* Profile Picture */}
                {profile?.role === 'tutor' && tutorProfile?.profile_picture_url ? (
                  <img
                    src={tutorProfile.profile_picture_url}
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover border-2 border-[#81C15E] mb-4"
                  />
                ) : profile?.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover border-2 border-[#81C15E] mb-4"
                  />
                ) : (
                  <FaUserCircle className="text-7xl text-[#81C15E] mb-4" />
                )}

                <h3 className="text-2xl font-semibold text-[#70B44A] mb-1">{profile?.full_name}</h3>
                {/* <p className="text-gray-600 mb-1">{user?.email}</p> */}

                {/* Verification Status for Tutor */}
                {profile?.role === 'tutor' ? (
                  <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${tutorProfile?.verification_status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : tutorProfile?.verification_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                    {tutorProfile?.verification_status === 'approved'
                      ? 'Verified Tutor'
                      : tutorProfile?.verification_status === 'pending'
                        ? 'Verification Pending'
                        : 'Verification Rejected'}
                  </span>
                ) : (
                  <span className="inline-block mt-2 text-xs px-3 py-1 bg-green-100 text-green-800 rounded-full">
                    Student
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Phone</p>
                  <p className="text-gray-800">{profile?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Email</p>
                  <p className="text-gray-600 mb-1">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Gender</p>
                  <p className="text-gray-800">{profile?.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Address</p>
                  <p className="text-gray-800">{profile?.address}</p>
                </div>
              </div>
            </div>

            {/* Tutor Profile Section */}
            {profile?.role === 'tutor' && tutorProfile && (
              <div className="bg-[#FBFDF6] rounded-lg shadow-md p-6 border border-gray-200 mb-6">
                <h3 className="text-xl font-semibold text-[#70B44A] mb-4 flex items-center gap-2">
                  <FaGraduationCap /> Academic Qualifications
                </h3>

                <div className="space-y-3 text-gray-700">
                  {/* SSC */}
                  <div className="pb-2">
                    <p className="font-medium">SSC</p>
                    <p className="text-sm">Result: {tutorProfile.ssc_result}</p>
                    {tutorProfile.ssc_department && <p className="text-sm">Department: {tutorProfile.ssc_department}</p>}
                  </div>

                  {/* HSC */}
                  <div className="border-t border-gray-300 pt-3">
                    <p className="font-medium">HSC</p>
                    <p className="text-sm">Result: {tutorProfile.hsc_result}</p>
                    {tutorProfile.hsc_department && <p className="text-sm">Department: {tutorProfile.hsc_department}</p>}
                  </div>

                  {/* Honours */}
                  {tutorProfile.honours_result && (
                    <div className="border-t border-gray-300 pt-3">
                      <p className="font-medium">Honours</p>
                      <p className="text-sm">Result: {tutorProfile.honours_result}</p>
                      <p className="text-sm">Institution: {tutorProfile.honours_institution}</p>
                      <p className="text-sm">Department: {tutorProfile.honours_department}</p>
                    </div>
                  )}

                  {/* Masters */}
                  {tutorProfile.masters_result && (
                    <div className="border-t border-gray-300 pt-3">
                      <p className="font-medium">Masters</p>
                      <p className="text-sm">Result: {tutorProfile.masters_result}</p>
                      <p className="text-sm">Institution: {tutorProfile.masters_institution}</p>
                      <p className="text-sm">Department: {tutorProfile.masters_department}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bio Section */}
            {profile?.role === 'tutor' && tutorProfile?.bio && (
              <div className="bg-[#FBFDF6] rounded-lg shadow-md p-6 border border-gray-200 mb-6">
                <h2 className="text-xl font-semibold text-[#70B44A] mb-3">About</h2>
                <p className="text-md text-gray-700">{tutorProfile.bio}</p>
              </div>
            )}
            {/* Edit Section */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => window.location.href = '/edit-profile'}
                className="flex items-center gap-2 border border-[#70B44A] text-black px-4 py-2 rounded-md hover:bg-[#f3fff1] hover:cursor-pointer transition"
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

export default Dashboard;