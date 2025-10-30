import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';
import supabase from '../supabaseClient';
import { toast } from 'react-toastify';

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setError('Please login first');
          setLoading(false);
          return;
        }

        setUser(user);

        // Fetch applications for user's posts
        const response = await fetch(`http://localhost:5000/api/posts/applications/${user.id}`);
        const result = await response.json();

        if (result.success) {
          setApplications(result.applications);
        } else {
          setError(result.message);
        }
      } catch (error) {
        setError('Failed to load applications');
        console.error('Applications fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setApplications(applications.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        ));
        toast.success(`Application ${newStatus} successfully!`);
      } else {
        toast.error('Status update failed');
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Network error occurred');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFDF7] flex flex-col pt-20">
        <Navbar />
        <div className="flex flex-1">
          <SideBar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-while flex flex-col pt-20 pb-20 md:pb-0 md:ml-60">
      <Navbar />
      <div className="flex flex-1 flex-col md:flex-row">
        <SideBar />

        <div className="flex-1 p-6">

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {applications.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p>No applications received yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {applications.map((application) => (
                <div key={application.id} className="bg-[#FBFDF6] rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-xl transition">
                  {/* Post Info */}
                  <div className="border-b border-gray-300 pb-4 mb-4">
                    <div className='flex justify-between items-start'>
                      <div>
                        <h3 className="text-lg font-semibold text-[#70B44A] mb-2">
                          {application.post.class_level} - {application.post.subject}
                        </h3>
                        <div className="text-sm text-gray-600">
                          <span>Salary: ৳{application.post.salary} | Location: {application.post.location}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 flex items-center rounded-md text-xs font-medium ${application.status === 'pending' ? 'bg-yellow-100 border border-yellow-200 text-yellow-800' :
                        application.status === 'accepted' ? 'bg-green-100 border border-green-200 text-green-800' :
                          'bg-red-100 border border-red-200 text-red-800'
                        }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Applicant Info */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Applicant:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Name:</span> {application.applicant.full_name}</p>
                      {/* <p><span className="font-medium">Email:</span> {application.applicant.email}</p>
                      <p><span className="font-medium">Phone:</span> {application.applicant.phone}</p> */}
                    </div>
                  </div>

                  {/* Application Message */}
                  {application.message && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-1">Message:</h4>
                      <p className="text-sm text-gray-600 p-2 border border-gray-300 rounded-md">
                        {application.message}
                      </p>
                    </div>
                  )}

                  {/* Status and Actions */}
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-gray-400">
                      Applied: {new Date(application.created_at).toLocaleDateString()}
                    </span>

                    {application.status === 'pending' && (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleStatusChange(application.id, 'accepted')}
                          className="border border-[#81C15E] text-black px-5 py-1 rounded-md text-sm hover:bg-[#81C15E] hover:text-white hover:cursor-pointer transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusChange(application.id, 'rejected')}
                          className="border border-red-500 text-red-500 px-4 py-1 rounded-md text-sm hover:bg-red-500 hover:text-white hover:cursor-pointer transition"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                  {application.status === 'accepted' && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
                      <h4 className="font-medium text-green-800 mb-2">Contact Information:</h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        {/* <p><span className="font-medium">Name:</span> {application.applicant.full_name}</p> */}
                        <p><span className="font-medium">Email:</span> {application.applicant.email}</p>
                        <p><span className="font-medium">Phone:</span> {application.applicant.phone}</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        You can now contact this tutor directly via phone or email.
                      </p>
                    </div>
                  )}

                  {application.status === 'rejected' && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-800">This application was rejected.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApplicationsPage;
