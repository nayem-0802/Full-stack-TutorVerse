import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Services = () => {
return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <Navbar />

<main className="flex-grow px-4 sm:px-10 pt-38">
  <div className="max-w-6xl mx-auto text-center">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">

      <div className="bg-[#FBFDF7]  rounded-xl text-center shadow-md p-6 hover:shadow-lg transition">
        <h2 className="text-xl text-[#70B44A] font-semibold mb-2">Tutor Search <span className='text-gray-800'>& Hiring</span></h2>
        <p>Easily find and hire tutors based on your preferred subjects and locations.</p>
      </div>

      <div className="bg-[#FBFDF7]  rounded-xl text-center shadow-md p-6 hover:shadow-lg transition">
        <h2 className="text-xl text-[#70B44A] font-semibold mb-2">Become <span className='text-gray-800'>a Tutor</span></h2>
        <p>Register yourself to become a tutor and reach thousands of students looking for guidance.</p>
      </div>

      <div className="bg-[#FBFDF7] rounded-xl text-center shadow-md p-6 hover:shadow-lg transition">
        <h2 className="text-xl text-[#70B44A] font-semibold mb-2">Posting <span className='text-gray-800'>Tuitions</span></h2>
        <p>Students can post their tuition needs with subject, class, location, salary and other details.</p>
      </div>

      <div className="bg-[#FBFDF7]  rounded-xl text-center shadow-md p-6 hover:shadow-lg transition">
        <h2 className="text-xl text-[#70B44A] font-semibold mb-2">Direct <span className='text-gray-800'>Communication</span></h2>
        <p>Communicate directly with tutors without any middlemen or hidden charges.</p>
      </div>

      <div className="bg-[#FBFDF7] rounded-xl text-center shadow-md p-6 hover:shadow-lg transition">
        <h2 className="text-xl text-[#70B44A] font-semibold mb-2">Tutor <span className='text-gray-800'>Verification</span></h2>
        <p>All varified tutors undergo document verification (Institution ID & NID) by admins before approval.</p>
      </div>

      <div className="bg-[#FBFDF7] rounded-xl text-center shadow-md p-6 hover:shadow-lg transition">
        <h2 className="text-xl text-[#70B44A] font-semibold mb-2">Transparent <span className='text-gray-800'>Platform</span></h2>
        <p>No media fees or hidden commissions. We focus on building a trustworthy learning environment.</p>
      </div>
    </div>
  </div>
</main>


      <Footer />
    </div>
  );
};

export default Services;
