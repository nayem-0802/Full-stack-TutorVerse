import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import supabase from "../supabaseClient";
import { toast } from "react-toastify";

const PostTuitionPage = () => {

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    classLevel: "",
    group: "",
    subject: "",
    salary: "",
    gender: "",
    location: "",
    requirement: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  //  File state add 
  const [studentIdCard, setStudentIdCard] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  // File change handler add 
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
      setStudentIdCard(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  // Upload function add 
  const uploadStudentIdCard = async (userId) => {
    if (!studentIdCard) return null;

    const fileExt = studentIdCard.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `student-id-cards/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('tutor-documents')
      .upload(filePath, studentIdCard, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicData } = supabase.storage
      .from('tutor-documents')
      .getPublicUrl(filePath);

    return publicData.publicUrl;
  };




  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!formData.classLevel || !formData.subject || !formData.salary || !formData.location || !formData.gender) {
      setError("Please fill all required fields.");
      return;
    }

    // Student ID card required check
    if (!studentIdCard) {
      toast.error("Please upload your student ID card");
      return;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Please login first');
      return;
    }
    setUploading(true);
    try {

      // Upload student ID card
      // toast.info('Uploading student ID card...');
      const idCardUrl = await uploadStudentIdCard(user.id);

      // Backend API call
      const response = await fetch('http://localhost:5000/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id, 
          studentIdCardUrl: idCardUrl 
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        navigate('/my-post');
        setFormData({
          classLevel: "",
          group: "",
          subject: "",
          salary: "",
          gender: "",
          location: "",
          requirement: "",
        });
        setStudentIdCard(null);
        setPreviewUrl(null);
      } else {
        toast.error('Post failed: ' + result.message);
        // setError(result.message);
      }
    } catch (error) {
      toast.error('Network error: ' + error.message);
      // setError('Network error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white pt-20 pb-20 md:pb-0 md:ml-60">
      <Navbar />
      <div className="flex flex-grow flex-col md:flex-row">
        <SideBar />

        {/*Main Content */}
        <div className="flex-grow flex items-center justify-center px-4 sm:px-6 py-8">
          <div className="bg-[#FBFDF6] p-6 sm:p-8 rounded-lg shadow-md w-full max-w-xl border border-gray-200">
            <h2 className="text-xl font-bold text-center">
              <span className="text-[#70B44A]">Post</span> a Tuition
            </h2>
            <p className="text-sm text-center text-[#3A3A3A] mb-6">
              Fill in the details below to post your tuition 
            </p>

            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            {message && <p className="text-green-600 text-sm text-center mb-4">{message}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Student ID Card Upload Section  */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID Card (Required for verification)
                </label>
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="ID Card Preview"
                      className="w-full h-48 object-cover rounded-md border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setStudentIdCard(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 hover:cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="w-full border border-gray-300  bg-[#FDFAF6] rounded-md px-4 py-8 text-center cursor-pointer block ">
                    <div className="text-gray-500">
                      <p className="mb-2">Click to upload student ID card</p>
                      <p className="text-xs">PNG, JPG up to 2MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Class Level */}
              <div>
                <select
                  name="classLevel"
                  value={formData.classLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#70B44A] bg-[#FDFAF6]"
                  required
                >
                  <option value="">Select class</option>
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

              {/* Version */}
              <div>
                <select
                  name="group"
                  value={formData.group}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#70B44A] bg-[#FDFAF6]"
                  required
                >
                  <option value="">Select version</option>
                  <option value="Bangla Medium">Bangla Medium</option>
                  <option value="National Curriculum">National Curriculum</option>
                  <option value="British Curriculum">British Curriculum</option>
                  <option value="Madrasah Medium">Madrasah Medium</option>

                </select>
              </div>

              {/* Subject */}
              <div>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#70B44A] bg-[#FDFAF6]"
                  required
                >
                  <option value="">Select subject</option>
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

              {/* Tutor Gender */}
              <div>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#70B44A] bg-[#FDFAF6]"
               required
               >
                  <option value="">Tutor gender preference</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Any">Any</option>
                </select>
              </div>

              {/* Salary */}
              <div>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="Enter salary"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#70B44A] bg-[#FDFAF6]"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter tuition location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#70B44A] bg-[#FDFAF6]"
                  required
                />
              </div>

              {/* Requirement */}
              <div>
                <textarea
                  name="requirement"
                  value={formData.requirement}
                  onChange={handleChange}
                  placeholder="Other requirements:&#10;Day-4&#10;Hour-1.5h&#10;"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#70B44A] bg-[#FDFAF6]"
                  rows="4"
                  required
                ></textarea>
              </div>

              {/* Submit button */}
              <div className="flex justify-center">
                <button
                type="submit"
                disabled={uploading}
                className="w-full items-center sm:w-1/3 bg-[#70B44A] text-white px-6 py-2 rounded-md hover:cursor-pointer hover:bg-[#5a983b] transition disabled:cursor-not-allowed"
              >
                {uploading ? 'Submitting...' : 'Post Tuition'}
              </button>
              </div>
              
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostTuitionPage;


