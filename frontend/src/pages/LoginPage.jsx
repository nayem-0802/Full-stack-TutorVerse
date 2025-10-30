import React, { useState } from 'react';
import supabase from '../supabaseClient';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    //  Check if email has any uppercase letter
    if (formData.email !== formData.email.toLowerCase()) {
      setError('Please use your valid email.');
      return;
    }

    // Backend test API call
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Login successful.');
      } else {
        // toast.error('Login failed: ' + result.message); 
        setError(result.message);
      }
    } catch (error) {
      toast.error('Network error: ' + error.message);
      // setError('Network error occurred');
    }

    // try {
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password
    });

    if (loginError) {
      setError(loginError.message);
      return;
    }

    // my extra code

    const user = data.user;

    // Check if profile exists
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profileData) {
      //Get profile info from localStorage
      const stored = JSON.parse(localStorage.getItem('profileInfo'));

      if (stored) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          ...stored
        });

        if (insertError) {
          setError("Login success but profile creation failed: " + insertError.message);
        } else {
          localStorage.removeItem('profileInfo');
          window.location.href = "/";
        }
      } else {
        setError("No profile info found. Please re-register.");
      }
    } else {
      // Check if user is admin and redirect accordingly
      if (profileData.role === 'admin') {
        window.location.href = "/admin";
      } else if (profileData.role === 'tutor') {
        // Check if tutor profile exists
        const { data: tutorProfile } = await supabase
          .from('tutor_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!tutorProfile) {
          // Tutor profile না থাকলে tutor form এ redirect
          window.location.href = "/tutor-form";
        } else {
          // Tutor profile আছে তাহলে dashboard এ
          window.location.href = "/";
        }
      } else {
        window.location.href = "/";
      }
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-white pt-20">
      <Navbar />

      <div className="flex-grow flex items-center justify-center px-4 sm:px-6">
        <div className="bg-[#FBFDF6] p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
          <h2 className="text-xl font-bold text-center mb-2">
            <span className="text-[#70B44A]">Welcome Back</span> to <span className="text-black">TutorVerse</span>
          </h2>
          <p className="text-sm text-center text-[#3A3A3A] mb-6">
            Please login to continue your journey.
          </p>

          {message && <p style={{ color: 'green' }}>{message}</p>}

          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full px-4 py-2 border border-[#BEBDBD] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#70B44A] bg-[#FDFAF6]"
                required
              />
            </div>

            <div className="mb-3">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full px-4 py-2 border border-[#BEBDBD] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#70B44A] bg-[#FDFAF6]"
                required
              />
            </div>

            <div className="flex justify-end mb-4">
              <a href="/forgot-password" className="text-sm text-[#70B44A] hover:underline">
                Forgot Password?
              </a>
            </div>

            <div className="flex justify-center mt-4">
              <button
                type="submit"
                className="w-full sm:w-1/2 border border-[#70B44A] bg-[#FDFAF6] px-6 py-1.5 rounded-md text-[#000000] font-semibold hover:cursor-pointer hover:bg-[#f3fff1] transition"
              >
                Login
              </button>
            </div>

            <p className="text-center text-sm text-black my-2">or</p>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => (window.location.href = '/registration')}
                className="bg-[#70B44A] w-full sm:w-1/2 text-white px-6 py-1.5 rounded-md hover:cursor-pointer hover:bg-[#5a983b] transition"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;