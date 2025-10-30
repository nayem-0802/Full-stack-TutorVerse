import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';
import supabase from '../supabaseClient';

const MyAppliedPostsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchMyApplications = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setError('Please login first');
          setLoading(false);
          return;
        }
        
        setUser(user);
        
        // Fetch applications where this user is the applicant
        const response = await fetch(`http://localhost:5000/api/posts/my-applications/${user.id}`);
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

    fetchMyApplications();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFDF7] flex flex-col pt-20">
        <Navbar />
        <div className="flex flex-1">
          <SideBar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg">Loading your applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pt-20 pb-20 md:pb-0 md:ml-60 ">
      <Navbar />
      <div className="flex flex-1 flex-col md:flex-row">
        <SideBar />
        <div className="flex-1 p-6">
          {/* <div className="mb-6">
            <h2 className="text-xl font-bold text-black"> <span className='text-[#70B44A]'>Applications</span> Response</h2>
            <p className="text-gray-600">Track your tuition applications</p>
          </div> */}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {applications.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p>You haven't applied to any posts yet.</p>
              
               <a href="/all-posts"
                className="inline-block mt-4 bg-[#70B44A] text-white px-6 py-2 rounded-md hover:bg-[#5a983b] transition"
              >
                Browse Posts
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {applications.map((application) => (
                <div key={application.id} className="bg-[#FBFDF6] rounded-lg shadow-md p-6 border border-gray-200">
                  {/* Post Info */}
                  <div className="border-b border-gray-300 pb-4 mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-[#70B44A] mb-2">
                          {application.post.class_level} - {application.post.subject}
                        </h3>
                        <div className="text-sm text-gray-600">
                          <span>Salary: ৳{application.post.salary} | Location: {application.post.location}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Your Message */}
                  {application.message && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-1">Your Message:</h4>
                      <p className="text-sm text-gray-600 p-2 border border-gray-200 rounded-md">
                        {application.message}
                      </p>
                    </div>
                  )}

                  {/* Contact Info if Accepted */}
                  {application.status === 'accepted' && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <h4 className="font-medium text-green-800 mb-2">Post Owner Contact:</h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p><span className="font-medium">Name:</span> {application.owner.full_name}</p>
                        <p><span className="font-medium">Email:</span> {application.owner.email}</p>
                        <p><span className="font-medium">Phone:</span> {application.owner.phone}</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Congratulations! You can now contact them directly.
                      </p>
                    </div>
                  )}

                  {application.status === 'rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-800">Unfortunately, this application was not accepted.</p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="mt-4 text-xs text-gray-400">
                    Applied: {new Date(application.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAppliedPostsPage;