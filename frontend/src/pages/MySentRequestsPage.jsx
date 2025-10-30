import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';
import supabase from '../supabaseClient';

const MySentRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchSentRequests = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setError('Please login first');
          setLoading(false);
          return;
        }

        setUser(user);

        console.log('Fetching requests for user:', user.id);

        // Fetch sent requests
        const response = await fetch(`http://localhost:5000/api/tutor-requests/student/${user.id}`);
        const result = await response.json();
        
        console.log('API Response:', result);
        
        if (result.success) {
          setRequests(result.requests);
        } else {
          setError(result.message);
        }
      } catch (error) {
        console.error('Requests fetch error:', error);
        setError('Failed to load requests');
      } finally {
        setLoading(false);
      }
    };

    fetchSentRequests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-20">
        <Navbar />
        <div className="flex flex-1">
          <SideBar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg">Loading your requests...</p>
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
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {requests.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p>You haven't sent any requests yet.</p>
              
              <a href="/all-tutors"
                className="inline-block mt-4 bg-[#70B44A] text-white px-6 py-2 rounded-md hover:bg-[#5a983b] transition"
              >
                Browse Tutors
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {requests.map((request) => (
                <div key={request.id} className="bg-[#FBFDF6] rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-xl transition">
                  {/* Request Header */}
                  <div className="border-b border-gray-300 pb-4 mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-[#70B44A] mb-2">
                          {request.tutor.first_name} {request.tutor.last_name}
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          {/* <p><span className="font-medium">SSC:</span> {request.tutor.ssc_result}</p>
                          <p><span className="font-medium">HSC:</span> {request.tutor.hsc_result}</p> */}
                          <p><span className="font-medium">Address:</span> {request.tutor.address}</p>

                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-md text-xs font-medium ${
                        request.status === 'pending' ? 'bg-yellow-100 border border-yellow-200 text-yellow-800' :
                        request.status === 'accepted' ? 'bg-green-100 border border-green-200 text-green-800' :
                        'bg-red-100 border border-red-200 text-red-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Your Message */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Your Message:</h4>
                    <p className="text-sm text-gray-600 p-2 border border-gray-300 rounded-md">
                      {request.message}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-gray-400 mb-4">
                    Sent: {new Date(request.created_at).toLocaleDateString()}
                  </div>

                  {/* Status Sections */}
                  {request.status === 'accepted' && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <h4 className="font-medium text-green-800 mb-2">Request Accepted</h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p><span className="font-medium">Email:</span> {request.tutor.email}</p>
                        <p><span className="font-medium">Phone:</span> {request.tutor.phone}</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        You can now contact this tutor directly via phone or email.
                      </p>
                    </div>
                  )}

                  {request.status === 'rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-800">Sorry,I am not available now.</p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <p className="text-sm text-yellow-800">Waiting for tutor's response...</p>
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

export default MySentRequestsPage;