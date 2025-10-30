import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';
import supabase from '../supabaseClient';
import { toast } from 'react-toastify';

const TutorRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // eslint-disable-next-line no-unused-vars
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError || !user) {
                    setError('Please login first');
                    setLoading(false);
                    return;
                }

                setUser(user);

                // Fetch requests
                const response = await fetch(`http://localhost:5000/api/tutor-requests/tutor/${user.id}`);
                const result = await response.json();

                if (result.success) {
                    setRequests(result.requests);
                } else {
                    setError(result.message);
                }
            } catch (error) {
                setError('Failed to load requests');
                console.error('Requests fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const handleStatusUpdate = async (requestId, status) => {
        try {
            const response = await fetch(`http://localhost:5000/api/tutor-requests/${requestId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            const result = await response.json();

            if (result.success) {
                toast.success(`Request ${status} successfully!`);
                // Update local state
                setRequests(requests.map(req =>
                    req.id === requestId ? { ...req, status } : req
                ));
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to update request status');
            console.log(error)
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col pt-20">
                <Navbar />
                <div className="flex flex-1">
                    <SideBar />
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-lg">Loading requests...</p>
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
                            <p>No requests received yet.</p>
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
                                                    {request.student.full_name}
                                                </h3>
                                                <div className="text-sm text-gray-600 space-y-1">
                                                    <p><span className="font-medium">Address:</span> {request.student.address}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 flex items-center rounded-md text-xs font-medium ${request.status === 'pending' ? 'bg-yellow-100 border border-yellow-200 text-yellow-800' :
                                                request.status === 'accepted' ? 'bg-green-100 border border-green-200 text-green-800' :
                                                    'bg-red-100 border border-red-200 text-red-800'
                                                }`}>
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className="mb-4">
                                        <h4 className="font-medium text-gray-700 mb-2">Message:</h4>
                                        <p className="text-sm text-gray-600 p-2 border border-gray-300 rounded-md">
                                            {request.message}
                                        </p>
                                    </div>

                                    {/* Timestamp */}
                                    <div className="text-xs text-gray-400 mb-4">
                                        Received: {new Date(request.created_at).toLocaleDateString()}
                                    </div>

                                    {/* Status Sections */}
                                    {request.status === 'accepted' && (
                                        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                                            <h4 className="font-medium text-green-800 mb-2">Request Accepted</h4>
                                            <div className="text-sm text-gray-700 space-y-1">
                                                <p><span className="font-medium">Student Email:</span> {request.student.email}</p>
                                                <p><span className="font-medium">Student Phone:</span> {request.student.phone}</p>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-2">
                                                Also student can now see your contact information.
                                            </p>
                                        </div>
                                    )}

                                    {request.status === 'rejected' && (
                                        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                                            <p className="text-sm text-red-800">This request was rejected.</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {request.status === 'pending' && (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleStatusUpdate(request.id, 'accepted')}
                                                className="border border-[#81C15E] text-black px-5 py-1 rounded-md text-sm hover:bg-[#81C15E] hover:text-white transition"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                                className="border border-red-500 text-red-500 px-4 py-1 rounded-md text-sm hover:bg-red-500 hover:text-white transition"
                                            >
                                                Reject
                                            </button>
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

export default TutorRequestsPage;