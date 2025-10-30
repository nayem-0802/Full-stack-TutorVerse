import React, { useState } from 'react';
import supabase from '../supabaseClient';
import { toast } from 'react-toastify';

const UpdatePassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!passwordRegex.test(formData.password)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        setError(error.message);
      } else {
        toast.success('Password updated successfully!');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (error) {
      toast.error('Something went wrong! Try again later.');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F5] pt-20">
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6">
        <div className="bg-[#FBFDF6] p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
          <h2 className="text-xl font-bold text-center mb-2">
            <span className="text-[#70B44A]">Reset</span> Your Password
          </h2>
          <p className="text-sm text-center text-[#3A3A3A] mb-6">
            Enter your new password below
          </p>

          {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
          {message && <p className="text-green-600 text-sm text-center mb-3">{message}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter New Password"
                className="w-full px-4 py-2 border border-[#BEBDBD] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#70B44A] bg-[#FDFAF6]"
                required
              />
            </div>

            <div className="mb-4">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm New Password"
                className="w-full px-4 py-2 border border-[#BEBDBD] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#70B44A] bg-[#FDFAF6]"
                required
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-1/2 border border-[#70B44A] bg-[#FDFAF6] px-6 py-1.5 rounded-md text-[#000000] font-semibold hover:bg-[#f3fff1] transition hover:cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-black mt-4">
            Remembered your password?{' '}
            <a href="/login" className="text-[#70B44A] font-semibold hover:underline">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;