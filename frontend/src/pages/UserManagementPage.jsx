import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import { FaUser, FaTrash, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AdminNavbar from '../components/AdminNavbar';

const UserManagementPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    userId: null,
    userName: ''
  });
  const [roleModal, setRoleModal] = useState({
    open: false,
    userId: null,
    userName: '',
    newRole: ''
  });

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

        fetchUsers();
      } catch (error) {
        console.error('Check error:', error);
        navigate('/login');
      }
    };

    checkAdminAndFetch();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users');
      const result = await response.json();

      if (result.success) {
        setUsers(result.users);
        setFilteredUsers(result.users);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  // Changed: window.confirm কে modal দিয়ে replace করা হয়েছে
  const handleRoleChange = async (userId, newRole, userName) => {
    setRoleModal({
      open: true,
      userId,
      userName,
      newRole
    });
  };

  // Added: Role change confirm function
  const confirmRoleChange = async () => {
    const { userId, newRole } = roleModal;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('User role updated successfully');
        fetchUsers();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update user role');
      console.log(error)
    } finally {
      setRoleModal({ open: false, userId: null, userName: '', newRole: '' });
    }
  };

  const handleDeleteUser = async () => {
    const { userId } = deleteModal;

    if (!userId) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete user');
      console.log(error)
    } finally {
      setDeleteModal({ open: false, userId: null, userName: '' });
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
      {/* Changed: p-6 -> px-4 sm:px-6 for better mobile padding */}
      <div className="flex-1 px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Changed: flex-col sm:flex-row for mobile responsive heading */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-[#70B44A]">User <span className='text-black'>Management</span></h1>
          </div>

          {/* Search - already responsive */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FBFDF6] px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
            />
          </div>

          {/* Changed: Desktop এ table, Mobile এ card layout */}
          {/* Desktop Table - hidden on mobile */}
          <div className="hidden md:block bg-[#FBFDF6] rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#FBFDF6] border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.profile_picture_url ? (
                          <img
                            src={user.profile_picture_url}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <FaUser className="text-2xl text-[#70B44A]" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-sm text-gray-500">{user.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{user.email}</p>
                      <p className="text-sm text-gray-500">{user.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      {/* Changed: onChange এ userName parameter add করা হয়েছে */}
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value, user.full_name)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#70B44A] hover:cursor-pointer"
                      >
                        <option value="student">Student</option>
                        <option value="tutor">Tutor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setDeleteModal({
                          open: true,
                          userId: user.id,
                          userName: user.full_name
                        })}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Delete User"
                      >
                        <FaTrash className='hover:cursor-pointer' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Added: Mobile Card Layout - visible only on mobile */}
          <div className="md:hidden space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-[#FBFDF6] rounded-lg shadow-md p-4 border border-gray-200">
                {/* User Info */}
                <div className="flex items-start gap-3 mb-3">
                  {user.profile_picture_url ? (
                    <img
                      src={user.profile_picture_url}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full object-cover bg-opacity-0 flex items-center justify-center flex-shrink-0">
                      <FaUser className="text-2xl text-[#70B44A]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 ">{user.full_name}</p>
                    <p className="text-sm text-gray-500">{user.gender}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mb-3 space-y-1">
                  <p className="text-sm text-gray-900 ">{user.email}</p>
                  <p className="text-sm text-gray-600">{user.phone}</p>
                </div>

                {/* Role & Actions */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-200">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value, user.full_name)}
                    className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                  >
                    <option value="student">Student</option>
                    <option value="tutor">Tutor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => setDeleteModal({
                      open: true,
                      userId: user.id,
                      userName: user.full_name
                    })}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-md transition"
                    title="Delete User"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Delete Confirmation Modal */}
          {deleteModal.open && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
              <div className="bg-[#FBFDF6] rounded-lg shadow-2xl p-6 w-full max-w-md border border-gray-200">
                <h3 className="text-xl font-semibold mb-4"><span className="text-red-500">Delete</span> User?</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <span className="font-semibold text-[#70B44A]">{deleteModal.userName}</span>? This action cannot be undone.
                </p>
                <div className="flex gap-5">
                  <button
                    onClick={() => setDeleteModal({ open: false, userId: null, userName: '' })}
                    className="flex-1 py-1 border border-[#81C15E] rounded-md text-black hover:bg-[#81C15E] hover:text-white hover:cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    className="flex-1 py-1 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Added: Role Change Confirmation Modal */}
          {roleModal.open && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
              <div className="bg-[#FBFDF6] rounded-lg shadow-2xl p-6 w-full max-w-md border border-gray-200">
                <h3 className="text-xl font-semibold mb-4"><span className="text-[#70B44A]">Change</span> Role?</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to change <span className="font-semibold text-[#70B44A]">{roleModal.userName}</span>'s role to <span className="font-semibold text-black">{roleModal.newRole}</span>?
                </p>
                <div className="flex gap-5">
                  <button
                    onClick={() => setRoleModal({ open: false, userId: null, userName: '', newRole: '' })}
                    className="flex-1 py-1 border border-[#81C15E] rounded-md text-black hover:bg-[#f3fff1] hover:cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRoleChange}
                    className="flex-1 py-1 border bg-[#70B44A] text-white rounded-md hover:bg-[#70B44A] hover:text-white transition cursor-pointer"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {filteredUsers.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              <p>No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;