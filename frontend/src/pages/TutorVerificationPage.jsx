import React, { useState, useEffect, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import { FaUser, FaCheckCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AdminNavbar from '../components/AdminNavbar';

const TutorVerificationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tutors, setTutors] = useState([]);
  const [filter, setFilter] = useState('pending');

  // Document viewer modal state - Institution ID এবং NID দেখার জন্য modal state add করা হয়েছে
  const [documentModal, setDocumentModal] = useState({
    open: false,
    imageUrl: '',
    documentType: '', // 'institution_id' or 'nid'
    tutorName: ''
  });

// fetchTutors function কে useCallback দিয়ে wrap করুন
const fetchTutors = useCallback(async () => {
  try {
    const url = filter === 'all' 
      ? 'http://localhost:5000/api/admin/tutors/all'
      : `http://localhost:5000/api/admin/tutors/${filter}`;
      
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.success) {
      setTutors(result.tutors);
    }
  } catch (error) {
    console.error('Fetch tutors error:', error);
    toast.error('Failed to load tutors');
  } finally {
    setLoading(false);
  }
}, [filter]); // filter dependency

useEffect(() => {
  const checkAdminAndFetch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/auth/profile/${user.id}`);
      const result = await response.json();
      
      if (!result.success || result.profile.role !== 'admin') {
        toast.error('Access denied');
        navigate('/dashboard');
        return;
      }

      fetchTutors();
    } catch (error) {
      console.error('Check error:', error);
      navigate('/login');
    }
  };

  checkAdminAndFetch();
}, [navigate, fetchTutors]); // fetchTutors dependency add

  const handleVerification = async (tutorId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/tutors/verify/${tutorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Tutor ${status} successfully`);
        fetchTutors();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update verification status');
      console.log(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-20">
        <AdminNavbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pt-20">
      <AdminNavbar />
      <div className="flex-1 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[#70B44A]">Tutor <span className='text-black'>Verification</span></h1>
          </div>

          {/* Filter Tabs */}
          {/* Responsive করা হয়েছে - mobile এ 2x2 grid, tablet+ এ horizontal */}
          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 mb-4 sm:mb-6">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 sm:px-4 py-2 rounded-md transition hover:cursor-pointer text-sm sm:text-base ${
                filter === 'pending' 
                  ? 'bg-[#70B44A] text-white' 
                  : 'bg-white border border-[#81C15E]'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 sm:px-4 py-2 rounded-md transition hover:cursor-pointer text-sm sm:text-base ${
                filter === 'approved' 
                  ? 'bg-[#70B44A] text-white' 
                  : 'bg-white border border-[#81C15E]'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-3 sm:px-4 py-2 rounded-md transition hover:cursor-pointer text-sm sm:text-base ${
                filter === 'rejected' 
                  ? 'bg-[#70B44A] text-white' 
                  : 'bg-white border border-[#81C15E]'
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-md transition hover:cursor-pointer text-sm sm:text-base ${
                filter === 'all' 
                  ? 'bg-[#70B44A] text-white' 
                  : 'bg-white border border-[#81C15E]'
              }`}
            >
              All
            </button>
          </div>

          {/* Tutors List */}
          {tutors.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p>No tutors found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {tutors.map((tutor) => (
                <div key={tutor.id} className="bg-[#FBFDF6] rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
                  <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                    {/* Left - Profile Info */}
                    <div className="flex-1">
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4">
                        {tutor.profile_picture_url ? (
                          <img 
                            src={tutor.profile_picture_url} 
                            alt="Profile" 
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-[#70B44A] flex-shrink-0"
                          />
                        ) : (
                          <FaUser className="text-3xl sm:text-4xl text-[#70B44A] flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-xl font-semibold text-[#70B44A] break-words">
                            {tutor.first_name} {tutor.last_name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 break-all">{tutor.email}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{tutor.phone}</p>

                          <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${
                            tutor.verification_status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : tutor.verification_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {tutor.verification_status}
                          </span>
                        </div>
                      </div>

                      {/* Academic Info */}
                      <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">SSC:</span> {tutor.ssc_result} {tutor.ssc_department && `- ${tutor.ssc_department}`}</p>
                        <p><span className="font-medium">HSC:</span> {tutor.hsc_result} {tutor.hsc_department && `- ${tutor.hsc_department}`}</p>
                        {tutor.honours_result && (
                          <p><span className="font-medium">Honours:</span> {tutor.honours_result} - {tutor.honours_institution}</p>
                        )}
                        {tutor.masters_result && (
                          <p><span className="font-medium">Masters:</span> {tutor.masters_result} - {tutor.masters_institution}</p>
                        )}
                      </div>

                      {tutor.bio && (
                        <div className="mt-3">
                          <p className="text-xs sm:text-sm text-gray-700"><span className="font-medium">Bio:</span> {tutor.bio}</p>
                        </div>
                      )}

                      {/* Verification Documents - Institution ID এবং NID show করার section add করা হয়েছে */}
                      {(tutor.institution_id_url || tutor.nid_url) && (
                        <div className="my-4 sm:my-5">
                          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Verification Documents:</p>
                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            {/* Institution ID Card */}
                            {tutor.institution_id_url && (
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Institution ID:</p>
                                <img 
                                  src={tutor.institution_id_url} 
                                  alt="Institution ID" 
                                  className="w-full h-20 sm:h-24 object-cover rounded-md border border-gray-300 cursor-pointer hover:opacity-80 transition"
                                  onClick={() => setDocumentModal({
                                    open: true,
                                    imageUrl: tutor.institution_id_url,
                                    documentType: 'Institution ID Card',
                                    tutorName: `${tutor.first_name} ${tutor.last_name}`
                                  })}
                                />
                                <p className="text-xs text-gray-500 mt-1 text-center">Click to view full size</p>
                              </div>
                            )}
                            
                            {/* NID Card */}
                            {tutor.nid_url && (
                              <div>
                                <p className="text-xs text-gray-600 mb-1">NID Card:</p>
                                <img 
                                  src={tutor.nid_url} 
                                  alt="NID" 
                                  className="w-full h-20 sm:h-24 object-cover rounded-md border border-gray-300 cursor-pointer hover:opacity-80 transition"
                                  onClick={() => setDocumentModal({
                                    open: true,
                                    imageUrl: tutor.nid_url,
                                    documentType: 'National ID Card',
                                    tutorName: `${tutor.first_name} ${tutor.last_name}`
                                  })}
                                />
                                <p className="text-xs text-gray-500 mt-1 text-center">Click to view full size</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right - Actions */}
                    {tutor.verification_status === 'pending' && (
                      <div className="flex flex-row md:flex-col gap-2 sm:gap-3 justify-center md:justify-start items-stretch md:items-center md:w-auto">
                        <button
                          onClick={() => handleVerification(tutor.id, 'approved')}
                          className="flex items-center justify-center gap-2 border border-[#81C15E] text-black px-4 sm:px-6 py-2 rounded-md hover:cursor-pointer text-sm sm:text-base whitespace-nowrap"
                        >
                          <FaCheckCircle className='text-[#81C15E]' /> Accept
                        </button>
                        <button
                          onClick={() => handleVerification(tutor.id, 'rejected')}
                          className="flex items-center justify-center gap-2 border border-red-400 text-red-500 px-4 sm:px-6 py-2 rounded-md hover:cursor-pointer text-sm sm:text-base whitespace-nowrap"
                        >
                          <FaTimesCircle /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal - Institution ID এবং NID full view  modal */}
      {/* z-[60] করা হয়েছে যাতে এটি details modal (z-50) এর উপরে থাকে এবং scroll issue fix হয় */}
      {documentModal.open && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
          <div className="bg-[#FBFDF6] rounded-lg shadow-2xl p-4 sm:p-6 w-full max-w-3xl border border-gray-200 relative">
            {/* Close button */}
            <button
              onClick={() => setDocumentModal({ open: false, imageUrl: '', documentType: '', tutorName: '' })}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 transition"
            >
              <FaTimes size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* Modal Header */}
            <h3 className="text-lg sm:text-xl font-semibold mb-1 text-[#70B44A] pr-8">
              {documentModal.documentType}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Tutor: {documentModal.tutorName}</p>

            {/* Image */}
            <div className="flex justify-center">
              <img 
                src={documentModal.imageUrl} 
                alt={documentModal.documentType} 
                className="max-w-full max-h-[60vh] sm:max-h-[70vh] object-contain rounded-md border border-gray-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default TutorVerificationPage;