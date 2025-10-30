import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';
import supabase from '../supabaseClient';
import { toast } from 'react-toastify';

const MyPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    postId: null,
    postTitle: ''
  });

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setError('Please login first');
          setLoading(false);
          return;
        }

        setUser(user);

        // Fetch user's posts from backend
        const response = await fetch(`http://localhost:5000/api/posts/my-posts/${user.id}`);
        const result = await response.json();

        if (result.success) {
          setPosts(result.posts);
          setFilteredPosts(result.posts); // Initially all posts 
        } else {
          setError(result.message);
        }
      } catch (error) {
        setError('Failed to load your posts');
        console.error('My posts fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, []);

  // Filter posts based on approval status 
  useEffect(() => {
    if (filter === 'all') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => post.approval_status === filter);
      setFilteredPosts(filtered);
    }
  }, [filter, posts]);

  const handleDelete = async () => {
    const { postId } = deleteModal;

    if (!postId) return;

    try {
      const response = await fetch(`http://localhost:5000/api/posts/delete/${postId}/${user.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Post deleted successfully!');
        // Remove deleted post from state
        setPosts(posts.filter(post => post.id !== postId));
      } else {
        toast.error('Delete failed: ' + result.message);
      }
    } catch (error) {
      toast.error('Network error occurred');
      console.log(error)
    } finally {
      setDeleteModal({ open: false, postId: null, postTitle: '' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFDF7] flex flex-col pt-20">
        <Navbar />
        <div className="flex flex-1">
          <SideBar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg">Loading your posts...</p>
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

          {/* Filter Tabs - Status filter tabs add  */}
          {posts.length > 0 && (
            <div className="flex justify-center gap-2 mb-6">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md transition hover:cursor-pointer ${filter === 'all'
                    ? 'bg-[#70B44A] text-white'
                    : 'bg-white border border-[#81C15E]'
                  }`}
              >
                All ({posts.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-md transition hover:cursor-pointer ${filter === 'pending'
                    ? 'bg-[#70B44A] text-white'
                    : 'bg-white border border-[#81C15E]'
                  }`}
              >
                Pending ({posts.filter(p => p.approval_status === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-md transition hover:cursor-pointer ${filter === 'approved'
                    ? 'bg-[#70B44A] text-white'
                    : 'bg-white border border-[#81C15E]'
                  }`}
              >
                Approved ({posts.filter(p => p.approval_status === 'approved').length})
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-md transition hover:cursor-pointer ${filter === 'rejected'
                    ? 'bg-[#70B44A] text-white'
                    : 'bg-white border border-[#81C15E]'
                  }`}
              >
                Rejected ({posts.filter(p => p.approval_status === 'rejected').length})
              </button>
            </div>
          )}

          {/* Posts Grid - filteredPosts use  */}
          {filteredPosts.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              {posts.length === 0 ? (
                <>
                  <p>You haven't created any posts yet.</p>

                  <a href="/post-tuition"
                    className="inline-block mt-4 bg-[#70B44A] text-white px-6 py-2 rounded-md hover:bg-[#5a983b] transition"
                  >
                    Create Your Post
                  </a>
                </>
              ) : (
                <p>No posts found in this category</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-[#FBFDF6] rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-xl transition">
                  {/* Post Content */}
                  <div className="mb-4">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-semibold text-[#70B44A] mb-2">
                        {post.class_level}
                      </h3>
                      {/* Approval status badge add */}
                      <span className={`text-xs px-2 py-1 rounded-full h-fit ${post.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                          post.approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                        {post.approval_status}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Group:</span> {post.group || 'Not specified'}</p>
                      <p><span className="font-medium">Salary:</span> ৳{post.salary}</p>
                      <p><span className="font-medium">Subject:</span> {post.subject}</p>
                      <p><span className="font-medium">Location:</span> {post.location}</p>
                      <p><span className="font-medium">Gender:</span> {post.gender}</p>
                    </div>
                  </div>

                  {post.requirement && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-1">Requirements:</h4>
                      <p className="text-sm text-gray-600 p-2 border border-gray-200 rounded-md">
                        {post.requirement}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-gray-400">
                      Posted: {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      {/* Edit button only for pending and rejected posts  */}
                      {(post.approval_status === 'pending' || post.approval_status === 'rejected') && (
                        <button
                          onClick={() => window.location.href = `/edit-post/${post.id}`}
                          className="border border-[#81C15E] text-black px-5 py-1 rounded-md text-sm hover:bg-[#81C15E] hover:text-white transition cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteModal({
                          open: true,
                          postId: post.id,
                          postTitle: `${post.class_level} - ${post.subject}`
                        })}
                        className="border border-red-500 text-red-500 px-3 py-1 rounded-md text-sm hover:bg-red-500 hover:text-white transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
          <div className="bg-[#FBFDF6] rounded-lg shadow-2xl p-6 w-full max-w-md border border-gray-200">
            <h3 className="text-xl font-semibold mb-4"><span className="text-red-500">Delete</span> Post?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold text-[#70B44A]">{deleteModal.postTitle}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-5">
              <button
                onClick={() => setDeleteModal({ open: false, postId: null, postTitle: '' })}
                className="flex-1 py-1 border border-[#81C15E] rounded-md text-black hover:bg-[#81C15E] hover:text-white hover:cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-1 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPostsPage;