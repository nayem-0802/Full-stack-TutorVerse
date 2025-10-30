import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import { FaTrash, FaCheckCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AdminNavbar from '../components/AdminNavbar';

const PostManagementPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('pending'); 
  // Modal states - Approval এবং Delete এর জন্য separate modals
  const [approveModal, setApproveModal] = useState({
    open: false,
    postId: null,
    postTitle: '',
    status: '' // 'approved' or 'rejected'
  });

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    postId: null,
    postTitle: ''
  });

  // Image viewer modal - Student ID card দেখার জন্য
  const [imageModal, setImageModal] = useState({
    open: false,
    imageUrl: '',
    studentName: ''
  });

  // Admin check এবং posts fetch
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

        // Fetch posts directly inside useEffect
        fetchPostsData();
      } catch (error) {
        console.error('Check error:', error);
        navigate('/login');
      }
    };

    // Fetch posts function inside useEffect
    const fetchPostsData = async () => {
      try {
        const url = filter === 'all'
          ? 'http://localhost:5000/api/admin/posts/all-status'
          : `http://localhost:5000/api/admin/posts/status/${filter}`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
          setPosts(result.posts);
        }
      } catch (error) {
        console.error('Fetch posts error:', error);
        toast.error('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetch();
  }, [navigate, filter]); // navigate এবং filter dependency ঠিক আছে

  // Fetch posts function for re-fetching after approval/delete
  const fetchPosts = async () => {
    try {
      const url = filter === 'all'
        ? 'http://localhost:5000/api/admin/posts/all-status'
        : `http://localhost:5000/api/admin/posts/status/${filter}`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setPosts(result.posts);
      }
    } catch (error) {
      console.error('Fetch posts error:', error);
      toast.error('Failed to load posts');
    }
  };

  // Handle approval/rejection - Post approve/reject করার function
  const handleApproval = async () => {
    const { postId, status } = approveModal;

    if (!postId) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/posts/approve/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Post ${status} successfully`);
        fetchPosts();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update post status');
      console.log(error);
    } finally {
      setApproveModal({ open: false, postId: null, postTitle: '', status: '' });
    }
  };

  // Handle delete - Post delete করার function
  const handleDeletePost = async () => {
    const { postId } = deleteModal;

    if (!postId) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/posts/${postId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Post deleted successfully');
        fetchPosts();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete post');
      console.log(error)
    } finally {
      setDeleteModal({ open: false, postId: null, postTitle: '' });
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
            <h1 className="text-xl sm:text-2xl font-bold text-[#70B44A]">Post <span className='text-black'>Management</span></h1>
          </div>

          {/* Filter Tabs - Status filter tabs add করা হয়েছে */}
          {/* Responsive করা হয়েছে - mobile এ 2x2 grid, tablet+ এ horizontal */}
          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 mb-4 sm:mb-6">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 sm:px-4 py-2 rounded-md transition hover:cursor-pointer text-sm sm:text-base ${filter === 'pending'
                  ? 'bg-[#70B44A] text-white'
                  : 'bg-white border border-[#81C15E]'
                }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 sm:px-4 py-2 rounded-md transition hover:cursor-pointer text-sm sm:text-base ${filter === 'approved'
                  ? 'bg-[#70B44A] text-white'
                  : 'bg-white border border-[#81C15E]'
                }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-3 sm:px-4 py-2 rounded-md transition hover:cursor-pointer text-sm sm:text-base ${filter === 'rejected'
                  ? 'bg-[#70B44A] text-white'
                  : 'bg-white border border-[#81C15E]'
                }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-md transition hover:cursor-pointer text-sm sm:text-base ${filter === 'all'
                  ? 'bg-[#70B44A] text-white'
                  : 'bg-white border border-[#81C15E]'
                }`}
            >
              All
            </button>
          </div>

          <div className="mb-4 text-sm text-gray-600">
            Total Posts: {posts.length}
          </div>

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p>No posts found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-[#FBFDF6] rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
                  {/* Post Header */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-[#70B44A]">
                        {post.class_level}
                      </h3>
                      {/* Approval status badge - Status badge add করা হয়েছে */}
                      <span className={`text-xs px-2 py-1 rounded-full ${post.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                          post.approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                        {post.approval_status}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1 mb-2">
                      <p><span className="font-medium">Subject:</span> {post.subject}</p>
                      <p><span className="font-medium">Salary:</span> ৳{post.salary}</p>
                      <p><span className="font-medium">Location:</span> {post.location}</p>
                      {post.group && (
                        <p><span className="font-medium">Group:</span> {post.group}</p>
                      )}
                    </div>
                    {/* Requirements */}
                    {post.requirement && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Requirements:</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{post.requirement}</p>
                      </div>
                    )}
                  </div>

                  {/* Student ID Card - নতুন section */}
                  {post.student_id_card_url && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Student ID Card:</p>
                      <img
                        src={post.student_id_card_url}
                        alt="Student ID"
                        className="w-full h-32 object-cover rounded-md border border-gray-300 cursor-pointer hover:opacity-80 transition"
                        onClick={() => setImageModal({
                          open: true,
                          imageUrl: post.student_id_card_url,
                          studentName: post.owner_name
                        })}
                      />
                      <p className="text-xs text-gray-500 mt-1 text-center">Click to view full size</p>
                    </div>
                  )}

                  {/* Post Owner */}
                  <div className="mb-4 p-3 rounded-md border border-gray-300">
                    <p className="text-sm font-medium text-gray-700">Posted by:</p>
                    <p className="text-sm text-gray-600">{post.owner_name}</p>
                    <p className="text-xs sm:text-sm text-gray-500 break-all">{post.owner_email}</p>
                  </div>

                  {/* Actions - Pending posts এর জন্য approve/reject buttons */}
                  {post.approval_status === 'pending' && (
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                      <button
                        onClick={() => setApproveModal({
                          open: true,
                          postId: post.id,
                          postTitle: `${post.class_level} - ${post.subject}`,
                          status: 'approved'
                        })}
                        className="flex-1 flex items-center justify-center gap-1 border border-[#81C15E] text-black px-3 py-2 rounded-md hover:bg-[#81C15E] hover:text-white hover:cursor-pointer transition text-sm"
                      >
                        <FaCheckCircle className='text-[#81C15E]' /> Approve
                      </button>
                      <button
                        onClick={() => setApproveModal({
                          open: true,
                          postId: post.id,
                          postTitle: `${post.class_level} - ${post.subject}`,
                          status: 'rejected'
                        })}
                        className="flex-1 flex items-center justify-center gap-1 border border-red-400 text-red-500 px-3 py-2 rounded-md hover:bg-red-500 hover:text-white hover:cursor-pointer transition text-sm"
                      >
                        <FaTimesCircle /> Reject
                      </button>
                    </div>
                  )}
                  {/* Delete button and Post date */}
                  {post.approval_status !== 'pending' && (

                    <div className="flex justify-between items-center gap-2">
                      <div className="text-xs text-gray-400">
                        Posted: {new Date(post.created_at).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => setDeleteModal({
                          open: true,
                          postId: post.id,
                          postTitle: `${post.class_level} - ${post.subject}`
                        })}
                        className="flex items-center gap-1 border border-red-400 text-red-500 px-2 py-1 rounded-md hover:bg-red-500 hover:text-white hover:cursor-pointer transition text-xs whitespace-nowrap"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approval Confirmation Modal - Approve/Reject confirmation modal */}
      {approveModal.open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
          <div className="bg-[#FBFDF6] rounded-lg shadow-2xl p-4 sm:p-6 w-full max-w-md border border-gray-200">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              <span className={approveModal.status === 'approved' ? 'text-[#70B44A]' : 'text-red-500'}>
                {approveModal.status === 'approved' ? 'Approve' : 'Reject'}
              </span> Post?
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Are you sure you want to {approveModal.status} <span className="font-semibold text-[#70B44A]">{approveModal.postTitle}</span>?
            </p>
            <div className="flex gap-3 sm:gap-5">
              <button
                onClick={() => setApproveModal({ open: false, postId: null, postTitle: '', status: '' })}
                className="flex-1 py-2 border border-[#81C15E] rounded-md text-black hover:bg-[#81C15E] hover:text-white hover:cursor-pointer transition text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleApproval}
                className={`flex-1 py-2 rounded-md transition cursor-pointer text-sm sm:text-base ${approveModal.status === 'approved'
                    ? 'border border-[#70B44A] bg-[#70B44A] text-white hover:bg-[#5a983b]'
                    : 'border border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                  }`}
              >
                {approveModal.status === 'approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Delete confirmation modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
          <div className="bg-[#FBFDF6] rounded-lg shadow-2xl p-4 sm:p-6 w-full max-w-md border border-gray-200">
            <h3 className="text-lg sm:text-xl font-semibold mb-4"><span className="text-red-500">Delete</span> Post?</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold text-[#70B44A]">{deleteModal.postTitle}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 sm:gap-5">
              <button
                onClick={() => setDeleteModal({ open: false, postId: null, postTitle: '' })}
                className="flex-1 py-2 border border-[#81C15E] rounded-md text-black hover:bg-[#81C15E] hover:text-white hover:cursor-pointer transition text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                className="flex-1 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition cursor-pointer text-sm sm:text-base"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student ID Card Image Viewer Modal - ID card full view করার modal */}
      {imageModal.open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
          <div className="bg-[#FBFDF6] rounded-lg shadow-2xl p-4 sm:p-6 w-full max-w-3xl border border-gray-200 relative">
            {/* Close button */}
            <button
              onClick={() => setImageModal({ open: false, imageUrl: '', studentName: '' })}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
            >
              <FaTimes size={24} />
            </button>

            {/* Modal Header */}
            <h3 className="text-lg sm:text-xl font-semibold text-[#70B44A]">
              Student ID Card :
            </h3>
            <p className="text-sm text-gray-600 mb-4">{imageModal.studentName}</p>

            {/* Image */}
            <div className="flex justify-center">
              <img
                src={imageModal.imageUrl}
                alt="Student ID Full View"
                className="max-w-full max-h-[70vh] object-contain rounded-md border border-gray-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostManagementPage;