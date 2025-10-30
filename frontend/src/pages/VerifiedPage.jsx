import React from 'react';
import Navbar from '../components/Navbar';

const VerifiedPage = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F5] pt-20">
      <Navbar />
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6 mt-10 bg-white rounded-md shadow-md border">
          <h2 className="text-2xl font-semibold text-[#70B44A] mb-4">Check Your Email </h2>
          <p className="text-gray-700 mb-4">
            A verification link has been sent to your email. Please complete the verification to log in.
          </p>
          <a
            href="/login"
            className="inline-block bg-[#70B44A] text-white px-6 py-2 rounded-md hover:bg-[#5a983b]"
          >
            Next
          </a>
        </div>
      </div>
    </div>
  );
};

export default VerifiedPage;
