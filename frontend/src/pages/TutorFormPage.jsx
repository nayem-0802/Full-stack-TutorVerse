import React, { useState, useEffect } from "react";
import { FaUserCircle, FaCamera } from 'react-icons/fa';
import Navbar from "../components/Navbar";
import supabase from "../supabaseClient";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const TutorFormPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userRole, setUserRole] = useState("");


  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    ssc: "",
    sscDept: "",
    hsc: "",
    hscDept: "",
    honours: "",
    honoursInstitution: "",
    honoursDept: "",
    masters: "",
    mastersInstitution: "",
    mastersDept: "",
    bio: "",
  });

  const [files, setFiles] = useState({
    profilePic: null,
    institutionId: null,
    nid: null
  });

  const [previewUrls, setPreviewUrls] = useState({
    profilePic: null,
    institutionId: null,
    nid: null
  });

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setUserRole(profile?.role || "");
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, fileType) => {
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

      setFiles({ ...files, [fileType]: file });

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrls({ ...previewUrls, [fileType]: previewUrl });
    }
  };

  const uploadFile = async (file, folder) => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // eslint-disable-next-line no-unused-vars
    const { data, error } = await supabase.storage
      .from('tutor-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('tutor-documents')
      .getPublicUrl(filePath);

    return publicData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required text fields
    if (!formData.firstName || !formData.lastName || !formData.ssc || !formData.hsc) {
      toast.error('Please fill all required fields');
      return;
    }

    // Validate required image uploads
    if (!files.profilePic) {
      toast.error('Please upload a profile picture');
      return;
    }

    if (!files.institutionId) {
      toast.error('Please upload your institution ID');
      return;
    }

    setUploading(true);

    try {
      // Upload files
      let profilePicUrl = null;
      let institutionIdUrl = null;
      let nidUrl = null;

      if (files.profilePic) {
        // toast.info('Uploading profile picture...');
        profilePicUrl = await uploadFile(files.profilePic, 'profile-pictures');
      }

      if (files.institutionId) {
        // toast.info('Uploading institution ID...');
        institutionIdUrl = await uploadFile(files.institutionId, 'institution-ids');
      }

      if (files.nid) {
        // toast.info('Uploading NID...');
        nidUrl = await uploadFile(files.nid, 'nids');
      }

      // Submit form with image URLs
      const response = await fetch('http://localhost:5000/api/tutors/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
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
          profilePicUrl: profilePicUrl,
          institutionIdUrl: institutionIdUrl,
          nidUrl: nidUrl
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);

        // Update user role to 'tutor'
        await fetch(`http://localhost:5000/api/auth/update-role/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role: 'tutor' })
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white pt-20">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen bg-white ${userRole === 'student' ? 'pt-20' : 'pt-0'}`}>
      {userRole === 'student' && <Navbar />}
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="bg-[#FBFDF6] p-6 sm:p-8 rounded-lg shadow-md w-full max-w-6xl border border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-center mb-6">
            Become a <span className="text-[#70B44A]">Tutor</span>
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LEFT SIDE - File Uploads */}
            <div className="flex flex-col items-center gap-6 col-span-1">
              {/* Profile Picture - Dashboard Style */}
              <div className="flex flex-col items-center w-full">
                <div className="relative mb-2">
                  {previewUrls.profilePic ? (
                    <img
                      src={previewUrls.profilePic}
                      alt="Preview"
                      className="w-28 h-28 rounded-full object-cover border-2 border-[#81C15E]"
                    />
                  ) : (
                    <FaUserCircle className="text-7xl text-[#81C15E]" />
                  )}

                  {/* Upload Button */}
                  <label
                    htmlFor="profile-pic-upload"
                    className="absolute bottom-0 right-0 bg-[#70B44A] text-white p-2 rounded-full cursor-pointer hover:bg-[#5a983b] transition shadow-lg"
                  >
                    <FaCamera />
                    <input
                      id="profile-pic-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'profilePic')}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
                <label className="text-sm font-medium text-gray-700 mb-3">
                  Profile Picture
                </label>
              </div>

              {/* Institution ID */}
              <div className="flex flex-col w-full">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Institution ID
                </label>
                {previewUrls.institutionId && (
                  <img
                    src={previewUrls.institutionId}
                    alt="Institution ID"
                    className="w-full h-32 object-cover rounded-md mb-2 border border-gray-300"
                  />
                )}
                <label className="w-full border border-[#70B44A] bg-[#FDFAF6] rounded-md px-4 py-2 text-center cursor-pointer hover:bg-[#f3fff1] transition text-sm">
                  {files.institutionId ? files.institutionId.name : 'Choose File'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'institutionId')}
                    className="hidden"
                  />
                </label>
              </div>

              {/* NID */}
              <div className="flex flex-col w-full">
                <label className="text-sm font-medium text-gray-700 mb-2">NID (Optional)</label>
                {previewUrls.nid && (
                  <img
                    src={previewUrls.nid}
                    alt="NID"
                    className="w-full h-32 object-cover rounded-md mb-2 border border-gray-300"
                  />
                )}
                <label className="w-full border border-[#70B44A] bg-[#FDFAF6] rounded-md px-4 py-2 text-center cursor-pointer hover:bg-[#f3fff1] transition text-sm">
                  {files.nid ? files.nid.name : 'Choose File'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'nid')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* RIGHT SIDE - Form Fields */}
            <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First & Last Name */}
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                required
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                required
              />

              {/* SSC */}
              <input
                type="text"
                name="ssc"
                value={formData.ssc}
                onChange={handleChange}
                placeholder="SSC Result (e.g., 5.00)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                required
              />
              <input
                type="text"
                name="sscDept"
                value={formData.sscDept}
                onChange={handleChange}
                placeholder="SSC Department/Group"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                required
             />

              {/* HSC */}
              <input
                type="text"
                name="hsc"
                value={formData.hsc}
                onChange={handleChange}
                placeholder="HSC Result (e.g., 5.00)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                required
              />
              <input
                type="text"
                name="hscDept"
                value={formData.hscDept}
                onChange={handleChange}
                placeholder="HSC Department/Group"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                required
              />

              {/* Honours */}
              <input
                type="text"
                name="honours"
                value={formData.honours}
                onChange={handleChange}
                placeholder="Honours Result (Optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  name="honoursInstitution"
                  value={formData.honoursInstitution}
                  onChange={handleChange}
                  placeholder="Institution"
                  className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                />
                <input
                  type="text"
                  name="honoursDept"
                  value={formData.honoursDept}
                  onChange={handleChange}
                  placeholder="Department"
                  className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                />
              </div>

              {/* Masters */}
              <input
                type="text"
                name="masters"
                value={formData.masters}
                onChange={handleChange}
                placeholder="Masters Result (Optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  name="mastersInstitution"
                  value={formData.mastersInstitution}
                  onChange={handleChange}
                  placeholder="Institution"
                  className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                />
                <input
                  type="text"
                  name="mastersDept"
                  value={formData.mastersDept}
                  onChange={handleChange}
                  placeholder="Department"
                  className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                />
              </div>

              {/* Bio */}
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about your teaching experience and expertise (Optional)"
                rows="4"
                className="col-span-1 sm:col-span-2 w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-[#FDFAF6] focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                required
              ></textarea>

              {/* Submit Button */}
              <div className="col-span-1 sm:col-span-2 flex justify-center mt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full sm:w-1/3 bg-[#70B44A] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#5a983b] hover:cursor-pointer transition disabled:cursor-not-allowed"
                >
                  {uploading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TutorFormPage;

