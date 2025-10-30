import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaCamera } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';
import supabase from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const EditTutorProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState(null);
  //for image
  const [currentProfilePic, setCurrentProfilePic] = useState(null);
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
    
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    const fetchTutorProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          toast.error('Please login first');
          navigate('/login');
          return;
        }
        
        setUser(user);
        
        // Fetch tutor profile
        const response = await fetch(`http://localhost:5000/api/tutors/my-profile/${user.id}`);
        const result = await response.json();
        
        if (result.success) {
          const tutor = result.tutorProfile;
          setCurrentProfilePic(tutor.profile_picture_url);  
          setFormData({
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
        } else {
          toast.error('Tutor profile not found');
          navigate('/tutor-form');
        }
      } catch (error) {
        toast.error('Failed to load profile');
        console.error('Profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
//-------------------------------- for image-------------------------------------------------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size should be less than 2MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setNewProfilePic(file);
      
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const uploadProfilePicture = async () => {
    if (!newProfilePic) return currentProfilePic;

    setUploading(true);

    const fileExt = newProfilePic.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `profile-pictures/${fileName}`;

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

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('tutor-documents')
      .getPublicUrl(filePath);

    setUploading(false);
    return publicData.publicUrl;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.ssc || !formData.hsc) {
      toast.error('Please fill all required fields');
      return;
    }

    setUpdating(true);

    try {
      // Upload new profile picture if selected
      let profilePicUrl = currentProfilePic;
      if (newProfilePic) {
        // toast.info('Uploading profile picture...');
        profilePicUrl = await uploadProfilePicture();
      }
//--------------------------------------------------------------------------------
      const response = await fetch(`http://localhost:5000/api/tutors/update-profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          sscResult: formData.ssc,
          sscDept: formData.sscDept,
          hscResult: formData.hsc,
          hscDept: formData.hscDept,
          honoursResult: formData.honours,
          honoursInst: formData.honoursInstitution,
          honoursDept: formData.honoursDept,
          mastersResult: formData.masters,
          mastersInst: formData.mastersInstitution,
          mastersDept: formData.mastersDept,
          bio: formData.bio,
          profilePicUrl: profilePicUrl // add line 
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Profile updated successfully!');
        setTimeout(() => {
          navigate('/tutor-profile');
        }, 1500);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-20">
        <Navbar />
        <div className="flex flex-1">
          <SideBar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg">Loading profile...</p>
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
              <h2 className="text-xl font-bold text-center mb-6">
                <span className="text-[#70B44A]">Edit</span> Tutor Profile
              </h2>
              
              {/* for image */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture Section - Dashboard Style */}
                <div className="flex flex-col items-center pb-6 border-b border-gray-300">
                  <div className="relative mb-4">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-28 h-28 rounded-full object-cover border-2 border-[#81C15E]"
                      />
                    ) : currentProfilePic ? (
                      <img 
                        src={currentProfilePic} 
                        alt="Profile" 
                        className="w-28 h-28 rounded-full object-cover border-2 border-[#81C15E]"
                      />
                    ) : (
                      <FaUserCircle className="text-7xl text-[#81C15E]" />
                    )}
                    
                    {/* Upload Button */}
                    <label 
                      htmlFor="profile-upload" 
                      className="absolute bottom-0 right-0 bg-[#70B44A] text-white p-2 rounded-full cursor-pointer hover:bg-[#5a983b] transition shadow-lg"
                    >
                      <FaCamera />
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading || updating}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {uploading && (
                    <p className="text-sm text-gray-600">Uploading...</p>
                  )}

                </div>

                {/* Rest of the form fields in grid */}               
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First & Last Name */}
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name *"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                    required
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name *"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                    required
                  />
                  
                  {/* SSC */}
                  <input
                    type="text"
                    name="ssc"
                    value={formData.ssc}
                    onChange={handleChange}
                    placeholder="SSC Result *"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                    required
                  />
                  <input
                    type="text"
                    name="sscDept"
                    value={formData.sscDept}
                    onChange={handleChange}
                    placeholder="SSC Department"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                  />
                  
                  {/* HSC */}
                  <input
                    type="text"
                    name="hsc"
                    value={formData.hsc}
                    onChange={handleChange}
                    placeholder="HSC Result *"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                    required
                  />
                  <input
                    type="text"
                    name="hscDept"
                    value={formData.hscDept}
                    onChange={handleChange}
                    placeholder="HSC Department"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                  />
                  
                  {/* Honours */}
                  <input
                    type="text"
                    name="honours"
                    value={formData.honours}
                    onChange={handleChange}
                    placeholder="Honours Result"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="honoursInstitution"
                      value={formData.honoursInstitution}
                      onChange={handleChange}
                      placeholder="Institution"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                    />
                    <input
                      type="text"
                      name="honoursDept"
                      value={formData.honoursDept}
                      onChange={handleChange}
                      placeholder="Department"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                    />
                  </div>
                  
                  {/* Masters */}
                  <input
                    type="text"
                    name="masters"
                    value={formData.masters}
                    onChange={handleChange}
                    placeholder="Masters Result"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="mastersInstitution"
                      value={formData.mastersInstitution}
                      onChange={handleChange}
                      placeholder="Institution"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                    />
                    <input
                      type="text"
                      name="mastersDept"
                      value={formData.mastersDept}
                      onChange={handleChange}
                      placeholder="Department"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                    />
                  </div>
                  
                  {/* Bio */}
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="About your teaching experience..."
                    rows="4"
                    className="col-span-1 sm:col-span-2 w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                  ></textarea>
                  
                  {/* Buttons */}
                  <div className="col-span-1 sm:col-span-2 flex gap-4 justify-center">
                    <button
                      type="submit"
                      disabled={updating || uploading}
                      className="w-full sm:w-1/3 bg-[#70B44A] text-white px-2 py-2 rounded-md hover:bg-[#5a983b] transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {updating ? 'Updating...' : 'Update Profile'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/tutor-profile')}
                      className="w-full sm:w-1/3 border border-[#70B44A] text-black px-2 py-2 rounded-md hover:bg-[#f3fff1] transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTutorProfilePage;