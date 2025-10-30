import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import RequestModal from '../components/RequestModal';
import { useParams } from 'react-router-dom';
import supabase from '../supabaseClient';
import { FaUser, FaGraduationCap, FaLock } from 'react-icons/fa'; 
import { toast } from 'react-toastify'; 

const TutorDetailsPage = () => {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Current user এর role track করার জন্য state add করা হয়েছে
  const [userRole, setUserRole] = useState(null);

  // Request modal এর জন্য state add করা হয়েছে
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null); // 'pending', 'accepted', 'rejected' বা null

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // User এর role check করা হচ্ছে (student/tutor)
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setUserRole(profile?.role);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    const fetchTutorDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/tutors/details/${tutorId}`);
        const result = await response.json();

        if (result.success) {
          setTutor(result.tutor);
          // User logged in এবং student role থাকলে request status check করা হবে
          if (user && userRole === 'student') {
            await checkRequestStatus(tutorId, user.id);
          }
        } else {
          setError(result.message);
        }
      } catch (error) {
        setError('Failed to load tutor details');
        console.error('Tutor details fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorDetails();
  }, [tutorId, user, userRole]);

  // Request status check করার function add করা হয়েছে (pending, accepted, rejected)
  const checkRequestStatus = async (tutorUserId, userId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/tutor-requests/check/${tutorUserId}/${userId}`
      );
      const result = await response.json();

      if (result.success && result.hasRequested) {
        // Request status set করা হচ্ছে (pending, accepted, rejected)
        setRequestStatus(result.status); // API থেকে status পাবে
      } else {
        setRequestStatus(null);
      }
    } catch (error) {
      console.error('Check request status error:', error);
    }
  };

  // Handle request click function add করা হয়েছে
  const handleRequestClick = () => {
    if (!user) {
      toast.warning('Please login first');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    // Pending request থাকলে আবার request করতে পারবে না
    if (requestStatus === 'pending') {
      toast.info('Your request is pending. Please wait for tutor response.');
      return;
    }

    setShowRequestModal(true);
  };

  // Handle send request submission function add করা হয়েছে
  const handleSendRequest = async (tutorUserId, message) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error('Please login first');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/tutor-requests/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: user.id,
          tutorId: tutorUserId,
          message: message
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        // Request status 'pending' এ set করা হচ্ছে
        setRequestStatus('pending');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-20">
        <Navbar />
        <div className="flex flex-1">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg">Loading tutor details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-20">
        <Navbar />
        <div className="flex flex-1">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-red-500">{error || 'Tutor not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pt-20">
      <Navbar />
      <div className="flex flex-1 flex-col md:flex-row">
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-[#FBFDF6] rounded-lg shadow-md p-6 border border-gray-200 mb-6">
              <div className="flex items-center gap-6">
                {tutor.profile_picture_url ? (
                  <img
                    src={tutor.profile_picture_url}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#70B44A]"
                  />
                ) : (
                  <FaUser className="text-6xl text-[#70B44A]" />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-[#70B44A]">
                    {tutor.first_name} {tutor.last_name}
                  </h1>
                  <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${tutor.verification_status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {tutor.verification_status === 'approved' ? 'Verified Tutor' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>

            {/* Academic Qualifications */}
            <div className="bg-[#FBFDF6] rounded-lg shadow-md p-6 border border-gray-200 mb-6">
              <h2 className="text-xl font-semibold text-[#70B44A] mb-4 flex items-center gap-2">
                <FaGraduationCap /> Academic Qualifications
              </h2>
              <div className="space-y-3 text-gray-700">
                <div className="pb-2">
                  <p className="font-medium">SSC</p>
                  <p className="text-sm">Result: {tutor.ssc_result}</p>
                  {tutor.ssc_department && <p className="text-sm">Department: {tutor.ssc_department}</p>}
                </div>

                <div className="border-t border-gray-300 pt-3">
                  <p className="font-medium">HSC</p>
                  <p className="text-sm">Result: {tutor.hsc_result}</p>
                  {tutor.hsc_department && <p className="text-sm">Department: {tutor.hsc_department}</p>}
                </div>

                {tutor.honours_result && (
                  <div className="border-t border-gray-300 pt-3">
                    <p className="font-medium">Honours</p>
                    <p className="text-sm">Result: {tutor.honours_result}</p>
                    <p className="text-sm">Institution: {tutor.honours_institution}</p>
                    <p className="text-sm">Department: {tutor.honours_department}</p>
                  </div>
                )}

                {tutor.masters_result && (
                  <div className="border-t border-gray-300 pt-3">
                    <p className="font-medium">Masters</p>
                    <p className="text-sm">Result: {tutor.masters_result}</p>
                    <p className="text-sm">Institution: {tutor.masters_institution}</p>
                    <p className="text-sm">Department: {tutor.masters_department}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {tutor.bio && (
              <div className="bg-[#FBFDF6] rounded-lg shadow-md p-6 border border-gray-200 mb-6">
                <h2 className="text-xl font-semibold text-[#70B44A] mb-3">About</h2>
                <p className="text-md text-gray-700">{tutor.bio}</p>
              </div>
            )}

            {/* শুধু logged in student দের জন্য দেখাবে, public view এবং tutor দের জন্য lock করা হয়েছে */}
            {user && userRole === 'student' ? (
              <div className="bg-[#FBFDF6] rounded-lg shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-[#70B44A] mb-4">Connect with Tutor</h2>
                <p className="text-gray-600 mb-4">
                  Send a request to express your interest in their tutoring services.
                </p>

                {/* Status অনুযায়ী button conditional rendering করা হয়েছে */}
                {/* Pending status - button disable থাকবে */}
                {requestStatus === 'pending' ? (
                  <div className="flex justify-center">
                    <button
                      disabled
                      className="w-full md:w-auto bg-yellow-100 border border-yellow-200 text-yellow-800 px-6 py-1 rounded-md cursor-not-allowed gap-2"
                    >
                      Request Pending
                    </button>
                  </div>

                ) : requestStatus === 'accepted' || requestStatus === 'rejected' ? (
                  // Accepted বা Rejected হলে আবার request button enable থাকবে
                  <div>
                    {requestStatus === 'accepted' && (
                      <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-800">
                          Your previous request was accepted. Check your responses.
                        </p>
                      </div>
                    )}
                    {requestStatus === 'rejected' && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">
                          Sorry,your previous request was declined. You can send another request.
                        </p>
                      </div>
                    )}
                    {/* Button width কমানো হয়েছে - full screen না */}
                    <div className="flex justify-center">
                      <button
                        onClick={handleRequestClick}
                        className="w-full md:w-auto bg-[#70B44A] text-white px-6 py-1 rounded-md hover:bg-[#5a983b] hover:cursor-pointer transition flex item-center justify-center"
                      >
                        Send Request
                      </button>
                    </div>
                  </div>
                ) : (
                  // কোন request না থাকলে normal button
                  <div className="flex justify-center">
                    <button
                      onClick={handleRequestClick}
                      className="w-full md:w-auto bg-[#70B44A] text-white px-6 py-2 rounded-md hover:bg-[#5a983b] transition"
                    >
                      Send Request
                    </button>
                  </div>
                )}
              </div>
            ) : !user ? (
              // Public view এর জন্য lock দেখানো হচ্ছে (user logged in না থাকলে)
              <div className="bg-[#FBFDF6] rounded-lg shadow-md p-6 border border-gray-200 text-center">
                <FaLock className="text-4xl text-gray-400 mx-auto mb-3" />
                <h2 className="text-xl font-semibold text-[#70B44A] mb-2">Connect with Tutor</h2>
                <p className="text-gray-600 mb-4">Login first to connect with tutor</p>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="bg-[#70B44A] text-white px-6 py-1 rounded-md hover:bg-[#5a983b] transition"
                >
                  Login Now
                </button>
              </div>
            ) : null}
            {/* Tutor role এর জন্য কিছু দেখাবে না */}
          </div>
        </div>
      </div>

      {/* Request Modal - Only show if user is logged in */}
      {/* শুধু student দের জন্য modal দেখাবে */}
      {user && userRole === 'student' && (
        <RequestModal
          tutor={tutor}
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSubmit={handleSendRequest}
        />
      )}
    </div>
  );
};

export default TutorDetailsPage;