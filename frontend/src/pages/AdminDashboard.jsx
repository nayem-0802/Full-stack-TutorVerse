import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import { FaUsers, FaGraduationCap, FaBook, FaCheckCircle } from 'react-icons/fa';
import AdminNavbar from '../components/AdminNavbar';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTutors: 0,
    pendingTutors: 0,
    totalPosts: 0,
    totalApplications: 0,
    pendingPosts: 0

  });

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          navigate('/login');
          return;
        }

        // Check if user is admin
        const response = await fetch(`http://localhost:5000/api/auth/profile/${user.id}`);
        const result = await response.json();

        if (!result.success || result.profile.role !== 'admin') {
          toast.warning('Access denied. Admin only.');
          // navigate('/dashboard');
          navigate('/')
          return;
        }

        // Fetch admin stats
        fetchStats();
      } catch (error) {
        console.error('Admin check error:', error);
        navigate('/login');
      }
    };

    checkAdmin();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats');
      const result = await response.json();

      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-20">
        <AdminNavbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pt-20">
      <AdminNavbar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-[#70B44A] mb-6">Admin <span className='text-black'>Dashboard</span></h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-[#FBFDF7] rounded-lg shadow-md p-6 border-l-4 border-blue-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
                </div>
                <FaUsers className="text-4xl text-blue-400" />
              </div>
            </div>

            <div className="bg-[#FBFDF7] rounded-lg shadow-md p-6 border-l-4 border-green-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Tutors</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalTutors}</p>
                </div>
                <FaGraduationCap className="text-4xl text-green-400" />
              </div>
            </div>

            <div className="bg-[#FBFDF7] rounded-lg shadow-md p-6 border-l-4 border-yellow-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Tutors</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.pendingTutors}</p>
                </div>
                <FaCheckCircle className="text-4xl text-yellow-400" />
              </div>
            </div>

            <div className="bg-[#FBFDF7] rounded-lg shadow-md p-6 border-l-4 border-purple-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Posts</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalPosts}</p>
                </div>
                <FaBook className="text-4xl text-purple-400" />
              </div>
            </div>

            <div className="bg-[#FBFDF7] rounded-lg shadow-md p-6 border-l-4 border-orange-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Posts</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.pendingPosts}</p>
                </div>
                <FaBook className="text-4xl text-orange-400" />
              </div>
            </div>
            {/* </div> */}

          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/tutors-verification')}
              className="bg-[#FBFDF6] rounded-lg shadow-md p-6 hover:shadow-xl transition text-left border border-gray-200 hover:cursor-pointer"
            >
              <h3 className="text-xl font-semibold text-[#70B44A] mb-2">Tutor Verification</h3>
              <p className="text-gray-600 text-sm">Review and approve pending tutor applications</p>
              {stats.pendingTutors > 0 && (
                <span className="inline-block mt-3 bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">
                  {stats.pendingTutors} pending
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/users-management')}
              className="bg-[#FBFDF6] rounded-lg shadow-md p-6 hover:shadow-xl transition text-left border border-gray-200 hover:cursor-pointer"
            >
              <h3 className="text-xl font-semibold text-[#70B44A] mb-2">User Management</h3>
              <p className="text-gray-600 text-sm">View and manage all registered users</p>
            </button>

            {/* Post Management button এ pending count badge add করা হয়েছে */}
            <button
              onClick={() => navigate('/posts-management')}
              className="bg-[#FBFDF6] rounded-lg shadow-md p-6 hover:shadow-xl transition text-left border border-gray-200 hover:cursor-pointer"
            >
              <h3 className="text-xl font-semibold text-[#70B44A] mb-2">Post Management</h3>
              <p className="text-gray-600 text-sm">Review and manage tuition posts</p>
              {stats.pendingPosts > 0 && (
                <span className="inline-block mt-3 bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full">
                  {stats.pendingPosts} pending approval
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;