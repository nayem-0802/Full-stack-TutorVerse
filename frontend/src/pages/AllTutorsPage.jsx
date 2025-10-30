import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import supabase from '../supabaseClient';
import { FaGraduationCap, FaUser, FaLock, FaSearch } from 'react-icons/fa';

const AllTutorsPage = () => {
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEducation, setFilterEducation] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tutors/all');
        const result = await response.json();
        
        if (result.success) {
          setTutors(result.tutors);
          setFilteredTutors(result.tutors);
        } else {
          setError(result.message);
        }
      } catch (error) {
        setError('Failed to load tutors');
        console.error('Tutors fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  // Filter tutors based on search and education level
  useEffect(() => {
    let filtered = tutors;

    // Text search - name, bio search
    if (searchTerm) {
      filtered = filtered.filter(tutor => {
        const fullName = `${tutor.first_name} ${tutor.last_name}`.toLowerCase();
        const bio = (tutor.bio || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        const address = (tutor.address || '').toLowerCase();
        
        return fullName.includes(search) || bio.includes(search) || address.includes(search);
      });
    }

    // Education level filter
    if (filterEducation) {
      filtered = filtered.filter(tutor => {
        if (filterEducation === 'masters' && tutor.masters_result) return true;
        if (filterEducation === 'honours' && tutor.honours_result) return true;
        if (filterEducation === 'hsc' && tutor.hsc_result) return true;
        if (filterEducation === 'ssc' && tutor.ssc_result) return true;
        return false;
      });
    }

    setFilteredTutors(filtered);
  }, [tutors, searchTerm, filterEducation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-20">
        <Navbar />
        <div className="flex flex-1">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg">Loading tutors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pt-20">
      <Navbar />
      <div className="flex flex-1 flex-col md:flex-row">
        <div className="flex-1 p-6">

          {/* Search and Filter Section */}
          <div className="bg-[#FBFDF6] p-4 rounded-lg shadow-sm mb-6 border border-gray-200 sticky top-21 z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* General Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by tutor name , location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                  />
                </div>
              </div>

              {/* Education Level Filter */}
              <div>
                <select
                  value={filterEducation}
                  onChange={(e) => setFilterEducation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                >
                  <option value="">All Education Levels</option>
                  <option value="masters">Masters</option>
                  <option value="honours">Honours/Bachelor</option>
                  <option value="hsc">HSC/A-Level</option>
                  <option value="ssc">SSC/O-Level</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-3 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {filteredTutors.length} tutors found{filteredTutors.length !== 1}
              </span>
              {(searchTerm || filterEducation) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterEducation('');
                  }}
                  className="text-sm text-[#70B44A] hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {filteredTutors.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <FaGraduationCap className="text-6xl mx-auto mb-4 text-gray-400" />
              <p>No tutors found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterEducation('');
                }}
                className="mt-4 text-[#70B44A] hover:underline"
              >
                Clear filters to see all tutors
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTutors.map((tutor) => (
                <div key={tutor.id} className="bg-[#FBFDF6] rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-xl transition">
                  {/* Tutor Header with Image */}
                  <div className="flex items-center gap-4 mb-4">
                    {tutor.profile_picture_url ? (
                      <img 
                        src={tutor.profile_picture_url} 
                        alt={`${tutor.first_name} ${tutor.last_name}`}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#70B44A]"
                      />
                    ) : (
                      <FaUser className="text-4xl text-[#70B44A]" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-[#70B44A]">
                        {tutor.first_name} {tutor.last_name}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        tutor.verification_status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tutor.verification_status === 'approved' ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Academic Info */}
                  <div className="text-sm text-gray-600 space-y-2 mb-4">
                    {tutor.masters_result && (
                      <p><span className="font-medium">Masters:</span> {tutor.masters_result}</p>
                    )}
                    {tutor.honours_result && (
                      <p><span className="font-medium">Honours:</span> {tutor.honours_result}</p>
                    )}
                    <p><span className="font-medium">HSC:</span> {tutor.hsc_result}</p>
                    <p><span className="font-medium">SSC:</span> {tutor.ssc_result}</p>
                  </div>

                  {/* Bio Preview */}
                  {tutor.bio && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{tutor.bio}</p>
                    </div>
                  )}

                  {/* Contact Info - Conditional */}
                  {user ? (
                    <div className="text-sm text-gray-600 mb-4 bg-green-50 p-3 rounded-md border border-green-200">
                      <p><span className="font-medium">Email:</span> {tutor.email}</p>
                      <p><span className="font-medium">Address:</span> {tutor.address}</p>

                    </div>
                  ) : (
                    <div className="mb-4 bg-green-50 p-3 rounded-md border border-green-200 text-center">
                      <FaLock className="inline text-gray-400 mb-1" />
                      <p className="text-xs text-gray-500">Login to view contact</p>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className='flex justify-center'>
                    <button
                    onClick={() => window.location.href = `/tutor-details/${tutor.user_id}`}
                    className="w-full md:w-1/3 bg-[#81C15E] text-white px-2 py-1 rounded-md hover:bg-[#5a983b] transition hover:cursor-pointer"
                  >
                    See Details
                  </button>
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
export default AllTutorsPage;