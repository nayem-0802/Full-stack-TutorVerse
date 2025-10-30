import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SideBar from "../components/SideBar";
import supabase from "../supabaseClient";
import { toast } from "react-toastify";

const EditPostPage = () => {
  const { postId } = useParams();
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
  
  // Student ID card states add 
  const [studentIdCard, setStudentIdCard] = useState(null); // new upload  file
  const [previewUrl, setPreviewUrl] = useState(null); // Preview URL (existing or new)
  const [existingIdCardUrl, setExistingIdCardUrl] = useState(null); // in Database , existing URL
  const [uploading, setUploading] = useState(false);
  
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Fetch post data for editing - useEffect for Post data load  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setError('Please login first');
          setLoading(false);
          return;
        }

        setUser(user);

        // Fetch post data for editing
        const response = await fetch(`http://localhost:5000/api/posts/edit/${postId}/${user.id}`);
        const result = await response.json();
        
        if (result.success) {
          const post = result.post;
          setFormData({
            classLevel: post.class_level,
            group: post.group || "",
            subject: post.subject,
            salary: post.salary,
            gender: post.gender,
            location: post.location,
            requirement: post.requirement || "",
          });
          
          // Existing student ID card URL set 
          if (post.student_id_card_url) {
            setExistingIdCardUrl(post.student_id_card_url);
            setPreviewUrl(post.student_id_card_url);
            console.log('Existing ID Card URL loaded:', post.student_id_card_url);
          } else {
            console.log('No existing ID card found');
          }
        } else {
          setError(result.message);
        }
      } catch (error) {
        setError('Failed to load post data');
        console.error('Post fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // File change handler - Student ID card upload - for new file select  handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size should be less than 2MB');
        e.target.value = null; // Clear input
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        e.target.value = null; // Clear input
        return;
      }

      setStudentIdCard(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      // toast.success('New ID card selected'); 
    }
  };

  // Upload student ID card to storage - Supabase storage এ upload করার function
  const uploadStudentIdCard = async (userId) => {
    if (!studentIdCard) return existingIdCardUrl; // যদি নতুন file না থাকে তাহলে existing URL return করা হচ্ছে

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
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data: publicData } = supabase.storage
      .from('tutor-documents')
      .getPublicUrl(filePath);

    return publicData.publicUrl;
  };

  // Form submit handler - Post update করার function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!formData.classLevel || !formData.subject || !formData.salary || !formData.location) {
      setError("Please fill all required fields.");
      return;
    }

    // Student ID card required check - Updated validation
    if (!existingIdCardUrl && !studentIdCard) {
      toast.error("Please upload your student ID card");
      return;
    }

    setUploading(true);

    try {
      let idCardUrl = existingIdCardUrl;

      // যদি নতুন ID card upload করা হয় তাহলে upload করা হচ্ছে
      if (studentIdCard) {
        // toast.info('Uploading new student ID card...');
        idCardUrl = await uploadStudentIdCard(user.id);
      }

      // Backend API call - Post update 
      const response = await fetch(`http://localhost:5000/api/posts/update/${postId}/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          studentIdCardUrl: idCardUrl // Send Student ID card URL 
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Post updated and sent for admin approval!');
        setTimeout(() => {
          navigate('/my-post');
        }, 1500);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      setError('Network error occurred');
      toast.error('Failed to update post: ' + error.message);
      console.error('Update error:', error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFDF7] flex flex-col pt-20">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg">Loading post data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFDF7] flex flex-col pt-20">
      <Navbar />       
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="bg-[#FBFDF6] p-6 sm:p-8 rounded-lg shadow-md w-full max-w-xl border border-gray-200">
          <h2 className="text-xl font-bold text-center">
            <span className="text-[#70B44A]">Edit</span> Tuition Post
          </h2>
          <p className="text-sm text-center text-[#3A3A3A] mb-6">
            Update your tuition post details.
          </p>

          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          {message && <p className="text-green-600 text-sm text-center mb-4">{message}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student ID Card Upload Section */}
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
                  {/* Remove/Reset button - Fix করা হয়েছে */}
                  <button
                    type="button"
                    onClick={() => {
                      if (studentIdCard) {
                        // যদি নতুন file select করা থাকে তাহলে সেটা remove করে existing এ back করুন
                        setStudentIdCard(null);
                        setPreviewUrl(existingIdCardUrl);
                      } else {
                        // যদি শুধু existing card থাকে তাহলে সেটা remove করুন
                        setStudentIdCard(null);
                        setPreviewUrl(null);
                        setExistingIdCardUrl(null);
                      }
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 hover:cursor-pointer transition"
                  >
                    Remove   
                 </button>
                </div>
              ) : (
                <label className="w-full border border-gray-300 bg-[#FDFAF6] rounded-md px-4 py-8 text-center cursor-pointer transition block">
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
                className="w-full px-3 py-2 border border-gray-300 bg-[#FDFAF6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
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
                className="w-full px-3 py-2 border border-gray-300 bg-[#FDFAF6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
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
                className="w-full px-3 py-2 border border-gray-300 bg-[#FDFAF6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
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

            {/*Tutor Gender */}
            <div>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 bg-[#FDFAF6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                required
              >
                <option value="">Select preferred tutor gender</option>
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
                className="w-full px-3 py-2 border border-gray-300 bg-[#FDFAF6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
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
                className="w-full px-3 py-2 border border-gray-300 bg-[#FDFAF6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
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
                className="w-full px-3 py-2 border border-gray-300 bg-[#FDFAF6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
                rows="3"
                required
              ></textarea>
            </div>

            {/* Buttons */}
            <div className="flex flex-col justify-center gap-4 sm:flex sm:flex-row">
              <button
                type="submit"
                disabled={uploading}
                className="w-full sm:w-1/3 bg-[#70B44A] text-white px-4 py-2 rounded-md hover:cursor-pointer hover:bg-[#5a983b] transition disabled:cursor-not-allowed"
              >
                {uploading ? 'Updating...' : 'Update'}
              </button>                
              <button
                type="button"
                onClick={() => navigate('/my-post')}
                className="w-full sm:w-1/3 border border-[#70B44A] text-black px-4 py-2 rounded-md hover:cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPostPage;