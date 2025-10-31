import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ApplyModal from '../components/ApplyModal';
import supabase from '../supabaseClient';
import { FaLock, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AllPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterGender, setFilterGender] = useState('');

  // Apply modal states
  const [selectedPost, setSelectedPost] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // User state for login checking
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  // Track applied posts
  const [appliedPosts, setAppliedPosts] = useState(new Set());

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Fetch user role
      if (user) {
        const response = await fetch(`http://localhost:5000/api/auth/profile/${user.id}`);
        const result = await response.json();
        if (result.success) {
          setUserRole(result.profile.role);
        }
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/posts/all');
        const result = await response.json();

        if (result.success) {
          setPosts(result.posts);
          setFilteredPosts(result.posts);
          // যদি user logged in থাকে তাহলে check করুন কোন posts এ apply করেছে
          if (user) {
            await checkAppliedPosts(result.posts, user.id);
          }
        } else {
          setError(result.message);
        }
      } catch (error) {
        setError('Failed to load posts');
        console.error('Posts fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user]);

  // Check which posts user has already applied to
  const checkAppliedPosts = async (postsList, userId) => {
    try {
      const appliedSet = new Set();

      // Check each post
      await Promise.all(
        postsList.map(async (post) => {
          const response = await fetch(
            `http://localhost:5000/api/posts/check-application/${post.id}/${userId}`
          );
          const result = await response.json();

          if (result.success && result.hasApplied) {
            appliedSet.add(post.id);
          }
        })
      );

      setAppliedPosts(appliedSet);
    } catch (error) {
      console.error('Check applied posts error:', error);
    }
  };

  // Filter posts based on search and filter criteria
  useEffect(() => {
    let filtered = posts;

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.class_level.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.requirement && post.requirement.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Class filter
    if (filterClass) {
      filtered = filtered.filter(post => post.class_level === filterClass);
    }

    // Subject filter
    if (filterSubject) {
      filtered = filtered.filter(post => post.subject === filterSubject);
    }

    // Location filter
    if (filterLocation) {
      filtered = filtered.filter(post =>
        post.location.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }

    // Gender filter
    if (filterGender) {
      filtered = filtered.filter(post => post.gender === filterGender);
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, filterClass, filterSubject, filterLocation, filterGender]);

  const handleApplyClick = (post) => {
    if (!user) {
      toast.warning('Please login first to apply for tuition posts.');
      return;
    }

    // Check if user is tutor
    if (userRole !== 'tutor') {
      toast.error('Only tutors can apply to posts. Please register as a tutor.');
      return;
    }

    // Check if own post
    if (post.user_id === user.id) {
      toast.error('You cannot apply to your own post.');
      return;
    }

    // Check if already applied
    if (appliedPosts.has(post.id)) {
      toast.info('You have already applied to this post.');
      return;
    }

    setSelectedPost(post);
    setShowApplyModal(true);
  };

  // Apply function for modal
  const handleApply = async (postId, message) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error('Please login first');
      return;
    }

    const response = await fetch(`http://localhost:5000/api/posts/apply/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        applicantId: user.id,
        message: message
      })
    });

    const result = await response.json();

    if (result.success) {
      toast.success(result.message);
      // Add to applied posts set
      setAppliedPosts(prev => new Set([...prev, postId]));
    } else {
      throw new Error(result.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-20">
        <Navbar />
        <div className="flex flex-1">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg">Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pt-20">
      <Navbar />
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Only show sidebar if user is logged in */}
        <div className="flex-1 p-6">

          {/* Search and Filter Section */}
          <div className="bg-[#FBFDF6] p-4 rounded-lg shadow-sm mb-6 sticky top-21">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search Input */}
              <div>
                <input
                  type="text"
                  placeholder="Search posts"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                />
              </div>

              {/* Class Filter */}
              <div>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                >
                  <option value="">Search by classes</option>
                  <option value="Pre-Schooling">Pre-Schooling</option>
                  <option value="Playgroup">Playgroup</option>
                  <option value="Nursery">Nursery</option>
                  <option value="KG-1">KG-1</option>
                  <option value="KG-2">KG-2</option>
                  <option value="Class-1">Class-1</option>
                  <option value="Class-2">Class-2</option>
                  <option value="Class-3">Class-3</option>
                  <option value="Class-4">Class-4</option>
                  <option value="Class-5">Class-5</option>
                  <option value="Class-6">Class-6</option>
                  <option value="Class-7">Class-7</option>
                  <option value="Class-8">Class-8</option>
                  <option value="Class-9">Class-9</option>
                  <option value="Class-10">Class-10</option>
                  <option value="O'Level">O'Level</option>
                  <option value="A'Level(AS)">A'Level(AS)</option>
                  <option value="A'Level(AS)">A'Level(A2)</option>
                  <option value="SSC Candidate">SSC Candidate</option>
                  <option value="HSC 1st Year">HSC 1st Year</option>
                  <option value="HSC 2nd Year">HSC 2nd Year</option>
                  <option value="HSC Candidate">HSC Candidate</option>
                  <option value="Alim 1st Year">Alim 1st Year</option>
                  <option value="Alim 2nd Year">Alim 2nd Year</option>
                  <option value="Alim Candidate">Alim Candidate</option>
                  <option value="Addmission">Addmission</option>
                </select>
              </div>

              {/* Subject Filter */}
              <div>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                >
                  <option value="">Search by subjects</option>
                  <option value="All-Subject">All-Subject</option>
                  <option value="All-Arts">All Arts</option>
                  <option value="All-Commerce">All Commerce</option>
                  <option value="All-Science">All Science</option>
                  <option value="English,Math,Science">English,Math,Science</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="ICT">ICT</option>
                  <option value="Statistics">Statistics</option>
                  <option value="Accounting">Accounting</option>
                  <option value="Finance">Finance</option>
                  <option value="Management">Management</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Business Studies">Business Studies</option>
                  <option value="Economics">Economics</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Political Science">Political Science</option>
                  <option value="Philosophy">Philosophy</option>
                  <option value="Sociology">Sociology</option>
                  <option value="Psychology">Psychology</option>
                  <option value="English">English</option>
                  <option value="Bangla">Bangla</option>
                  <option value="Islamic Studies">Islamic Studies</option>
                  <option value="Quran Majeed & Tajweed">Quran Majeed & Tajweed</option>
                  <option value="Hadith">Hadith</option>
                  <option value="Fiqh">Fiqh </option>
                  <option value="Aqaid">Aqaid </option>
                  <option value="Arabic">Arabic</option>
                  <option value="Tafsir">Tafsir</option>
                  <option value="Islamic History">Islamic History</option>
                  <option value="Balagah">Balagah </option>
                  <option value="Mantik">Mantik </option>
                  <option value="Sarf">Sarf </option>
                  <option value="Nahw">Nahw (Arabic Grammar)</option>
                  <option value="Tasauf">Tasauf </option>
                  <option value="Mantiq & Falsafa">Mantiq & Falsafa </option>
                  <option value="Ilmul Kalam">Ilmul Kalam </option>
                </select>
              </div>

              {/* Gender Filter */}
              <div>
                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                >
                  <option value="">Search by gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Any">Any</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <input
                  type="text"
                  placeholder="Search by location"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="mt-3 flex justify-between">
              {/* Results Count */}
              <div className="mt-2 text-sm text-gray-600">
                {filteredPosts.length} Tuitions found
              </div>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterClass('');
                  setFilterSubject('');
                  setFilterLocation('');
                  setFilterGender('');
                }}
                className="h-max bg-[#70B44A] text-white px-3 py-1 rounded-md text-sm hover:bg-[#5a983b] transition cursor-pointer"
              >
                Clear Filters
              </button>

            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {filteredPosts.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p>No posts found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => {
                const hasApplied = appliedPosts.has(post.id);
                const isBooked = post.is_booked;
                const isOwnPost = user && post.user_id === user.id;
                return (
                  <div key={post.id} className="bg-[#FBFDF6] rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-xl transition">
                    <div className="mb-4">
                      <div className='flex justify-between'>
                        <h3 className="text-lg font-semibold text-[#70B44A] mb-2">
                          {post.class_level}
                        </h3>
                        <h3 className="text-lg font-semibold text-[#70B44A] mb-2">
                          {post.gender}
                        </h3>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">Group: </span> {post.group || 'Not specified'}</p>
                        <p><span className="font-medium">Salary: </span> ৳{post.salary}</p>
                        <p><span className="font-medium">Subject: </span> {post.subject}</p>
                        <p><span className="font-medium">Location: </span> {post.location}</p>
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

                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xs text-gray-400">
                        Posted: {new Date(post.created_at).toLocaleDateString()}
                      </span>

                      {/* Apply Button - Conditional rendering */}
                      {isBooked ? (
                        <button disabled className="bg-[#FBFDF6] text-gray-500 px-4 py-1 rounded-md text-sm flex items-center cursor-not-allowed border border-[#81C15E]">
                          <FaCheckCircle className="mr-2" />
                          Booked
                        </button>
                      ) : isOwnPost ? (
                        <button disabled className="bg-gray-200 text-gray-500 px-4 py-1 rounded-md text-sm cursor-not-allowed border border-gray-300">
                          Apply now
                        </button>
                      ) : !user ? (
                        <button onClick={() => handleApplyClick(post)} className="bg-gray-200 text-gray-500 px-4 py-1 rounded-md text-sm transition flex items-center border border-gray-300 hover:cursor-pointer">
                          <FaLock className="mr-2" />
                          Apply Now
                        </button>
                      ) : userRole !== 'tutor' ? (
                        <button disabled className="bg-gray-300 text-gray-600 px-4 py-1 rounded-md text-sm cursor-not-allowed">
                          Apply now
                        </button>
                      ) : hasApplied ? (
                        <button disabled className="bg-gray-200 text-gray-500 px-4 py-1 rounded-md text-sm flex items-center cursor-not-allowed border border-gray-300">
                          <FaCheckCircle className="mr-2" />
                          Applied
                        </button>
                      ) : (
                        <button onClick={() => handleApplyClick(post)} className="bg-[#70B44A] text-white px-4 py-1 rounded-md text-sm hover:bg-[#5a983b] hover:cursor-pointer transition">
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal - Only show if user is logged in */}
      {user && (
        <ApplyModal
          post={selectedPost}
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          onSubmit={handleApply}
        />
      )}
    </div>
  );
};

export default AllPostsPage;