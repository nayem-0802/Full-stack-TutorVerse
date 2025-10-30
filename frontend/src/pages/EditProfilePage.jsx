import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';
import supabase from '../supabaseClient';
import { FaUserCircle, FaCamera } from 'react-icons/fa';
import { toast } from 'react-toastify';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Basic Profile Data
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    gender: '',
  });

  // Tutor Profile Data
  const [tutorFormData, setTutorFormData] = useState({
    firstName: '',
    lastName: '',
    ssc: '',
    sscDept: '',
    hsc: '',
    hscDept: '',
    honours: '',
    honoursInstitution: '',
    honoursDept: '',
    masters: '',
    mastersInstitution: '',
    mastersDept: '',
    bio: ''
  });

  // Profile Picture
  const [currentProfilePic, setCurrentProfilePic] = useState(null);
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          toast.error('Please login first');
          navigate('/login');
          return;
        }

        setUser(user);

        // Fetch basic profile
        const response = await fetch(`http://localhost:5000/api/auth/profile/${user.id}`);
        const result = await response.json();

        if (result.success) {
          const profileData = result.profile;
          setProfile(profileData);
          
          setFormData({
            fullName: profileData.full_name || '',
            phone: profileData.phone || '',
            address: profileData.address || '',
            gender: profileData.gender || '',
          });

          // If tutor, fetch tutor profile
          if (profileData.role === 'tutor') {
            const tutorResponse = await fetch(`http://localhost:5000/api/tutors/my-profile/${user.id}`);
            const tutorResult = await tutorResponse.json();
            
            if (tutorResult.success) {
              const tutor = tutorResult.tutorProfile;
              
              // Tutor profile picture use করুন
              setCurrentProfilePic(tutor.profile_picture_url || profileData.profile_picture_url);
              
              setTutorFormData({
                firstName: tutor.first_name || '',
                lastName: tutor.last_name || '',
                ssc: tutor.ssc_result || '',
                sscDept: tutor.ssc_department || '',
                hsc: tutor.hsc_result || '',
                hscDept: tutor.hsc_department || '',
                honours: tutor.honours_result || '',
                honoursInstitution: tutor.honours_institution || '',
                honoursDept: tutor.honours_department || '',
                masters: tutor.masters_result || '',
                mastersInstitution: tutor.masters_institution || '',
                mastersDept: tutor.masters_department || '',
                bio: tutor.bio || ''
              });
            }
          } else {
            // Student হলে profiles থেকে
            setCurrentProfilePic(profileData.profile_picture_url);
          }
        } else {
          toast.error('Failed to load profile data');
        }
      } catch (error) {
        toast.error('Failed to load profile data');
        console.error('Profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTutorChange = (e) => {
    setTutorFormData({ ...tutorFormData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size should be less than 2MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setNewProfilePic(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const uploadProfilePicture = async () => {
    if (!newProfilePic) return currentProfilePic;

    setUploading(true);

    const fileExt = newProfilePic.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `user-profiles/${fileName}`;

    const { error } = await supabase.storage
      .from('tutor-documents')
      .upload(filePath, newProfilePic, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Upload error:', error);
      setUploading(false);
      throw error;
    }

    const { data: publicData } = supabase.storage
      .from('tutor-documents')
      .getPublicUrl(filePath);

    setUploading(false);
    return publicData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.address || !formData.gender) {
      toast.error('Please fill all basic information fields');
      return;
    }

    // Tutor validation
    if (profile?.role === 'tutor') {
      if (!tutorFormData.firstName || !tutorFormData.lastName || !tutorFormData.ssc || !tutorFormData.hsc) {
        toast.error('Please fill all required tutor fields');
        return;
      }
    }

    setUploading(true);

    try {
      // Upload new profile picture if selected
      let profilePicUrl = currentProfilePic;
      if (newProfilePic) {
        toast.info('Uploading profile picture...');
        profilePicUrl = await uploadProfilePicture();
      }

      // Update basic profile
      const response = await fetch(`http://localhost:5000/api/auth/update-profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          gender: formData.gender
        })
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      // Update profile picture in profiles table
      if (profilePicUrl !== currentProfilePic && profile?.role === 'student') {
        await fetch(`http://localhost:5000/api/auth/update-profile-picture/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            profilePictureUrl: profilePicUrl
          })
        });
      }

      // Update tutor profile if tutor
      if (profile?.role === 'tutor') {
        const tutorResponse = await fetch(`http://localhost:5000/api/tutors/update-profile/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            firstName: tutorFormData.firstName,
            lastName: tutorFormData.lastName,
            sscResult: tutorFormData.ssc,
            sscDept: tutorFormData.sscDept,
            hscResult: tutorFormData.hsc,
            hscDept: tutorFormData.hscDept,
            honoursResult: tutorFormData.honours,
            honoursInst: tutorFormData.honoursInstitution,
            honoursDept: tutorFormData.honoursDept,
            mastersResult: tutorFormData.masters,
            mastersInst: tutorFormData.mastersInstitution,
            mastersDept: tutorFormData.mastersDept,
            bio: tutorFormData.bio,
            profilePicUrl: profilePicUrl // Image URL tutor_profiles এ save
          })
        });

        const tutorResult = await tutorResponse.json();
        if (!tutorResult.success) {
          toast.error('Failed to update tutor profile');
          return;
        }
      }

      toast.success('Profile updated successfully!');
      localStorage.removeItem('profile');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-20">
        <Navbar />
        <div className="flex flex-1">
          <SideBar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg">Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pt-20">
      <Navbar />
      <div className="flex flex-1 flex-col md:flex-row">
        <SideBar />
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#FBFDF6] p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
              {/* Profile Picture - সব users এর জন্য */}
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-28 h-28 rounded-full object-cover border-2 border-[#81C15E] mx-auto"
                    />
                  ) : currentProfilePic ? (
                    <img 
                      src={currentProfilePic} 
                      alt="Profile" 
                      className="w-28 h-28 rounded-full object-cover border-2 border-[#81C15E] mx-auto"
                    />
                  ) : (
                    <FaUserCircle className="text-7xl text-[#81C15E] mx-auto" />
                  )}
                  
                  <label 
                    htmlFor="profile-pic-upload" 
                    className="absolute bottom-0 right-0 bg-[#70B44A] text-white p-2 rounded-full cursor-pointer hover:bg-[#5a983b] transition shadow-lg"
                  >
                    <FaCamera />
                    <input
                      id="profile-pic-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
                
                {uploading && <p className="text-sm text-gray-600 mb-2">Uploading...</p>}
                {newProfilePic && !uploading && (
                  <p className="text-xs text-gray-600 mt-1">{newProfilePic.name}</p>
                )}
              </div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold">
                  <span className="text-[#70B44A]">Edit</span> Profile
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-[#70B44A] mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email (Cannot be changed)</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Tutor Information Section - শুধু tutor দের জন্য */}
                {profile?.role === 'tutor' && (
                  <div className="border-t pt-6 border-gray-300">
                    <h3 className="text-lg font-semibold text-[#70B44A] mb-4">Academic Qualifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* First & Last Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input
                          type="text"
                          name="firstName"
                          value={tutorFormData.firstName}
                          onChange={handleTutorChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          value={tutorFormData.lastName}
                          onChange={handleTutorChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                          required
                        />
                      </div>

                      {/* SSC */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SSC Result *</label>
                        <input
                          type="text"
                          name="ssc"
                          value={tutorFormData.ssc}
                          onChange={handleTutorChange}
                          placeholder="e.g., 5.00"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SSC Department</label>
                        <input
                          type="text"
                          name="sscDept"
                          value={tutorFormData.sscDept}
                          onChange={handleTutorChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                        />
                      </div>

                      {/* HSC */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">HSC Result *</label>
                        <input
                          type="text"
                          name="hsc"
                          value={tutorFormData.hsc}
                          onChange={handleTutorChange}
                          placeholder="e.g., 5.00"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">HSC Department</label>
                        <input
                          type="text"
                          name="hscDept"
                          value={tutorFormData.hscDept}
                          onChange={handleTutorChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                        />
                      </div>

                      {/* Honours */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Honours Result</label>
                        <input
                          type="text"
                          name="honours"
                          value={tutorFormData.honours}
                          onChange={handleTutorChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Honours Institution</label>
                        <input
                          type="text"
                          name="honoursInstitution"
                          value={tutorFormData.honoursInstitution}
                          onChange={handleTutorChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Honours Department</label>
                        <input
                          type="text"
                          name="honoursDept"
                          value={tutorFormData.honoursDept}
                          onChange={handleTutorChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                        />
                      </div>

                      {/* Masters */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Masters Result</label>
                        <input
                          type="text"
                          name="masters"
                          value={tutorFormData.masters}
                          onChange={handleTutorChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Masters Institution</label>
                        <input
                          type="text"
                          name="mastersInstitution"
                          value={tutorFormData.mastersInstitution}
                          onChange={handleTutorChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Masters Department</label>
                        <input
                          type="text"
                          name="mastersDept"
                          value={tutorFormData.mastersDept}
                          onChange={handleTutorChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                        />
                      </div>

                      {/* Bio */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                          name="bio"
                          value={tutorFormData.bio}
                          onChange={handleTutorChange}
                          rows="4"
                          placeholder="Tell us about your teaching experience and expertise..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full sm:w-1/3 bg-[#70B44A] text-white px-6 py-2 rounded-md hover:bg-[#5a983b] hover:cursor-pointer transition disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Updating...' : 'Update Profile'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    disabled={uploading}
                    className="w-full sm:w-1/3 border border-[#70B44A] text-black px-6 py-2 rounded-md hover:bg-[#f3fff1] hover:cursor-pointer transition disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;