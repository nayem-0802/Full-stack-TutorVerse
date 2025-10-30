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
        <h2 className="text-xl text-[#70B44A] font-semibold mb-2">Tutor Search & Hiring</h2>
        <p>Easily find and hire tutors based on your preferred subjects and locations.</p>
      </div>

      <div className="bg-[#FBFDF7]  rounded-xl text-center shadow-md p-6 hover:shadow-lg transition">
        <h2 className="text-xl text-[#70B44A] font-semibold mb-2">Become a Tutor</h2>
        <p>Register yourself to become a tutor and reach thousands of students looking for guidance.</p>
      </div>

      <div className="bg-[#FBFDF7] rounded-xl text-center shadow-md p-6 hover:shadow-lg transition">
        <h2 className="text-xl text-[#70B44A] font-semibold mb-2">User Profiles & Reviews</h2>
        <p>View detailed profiles and reviews to make informed decisions about tutors and students.</p>
      </div>

      <div className="bg-[#FBFDF7]  rounded-xl text-center shadow-md p-6 hover:shadow-lg transition">
        <h2 className="text-xl text-[#70B44A] font-semibold mb-2">Direct Communication</h2>
        <p>Communicate directly with tutors without any middlemen or hidden charges.</p>
      </div>

      <div className="bg-[#FBFDF7] rounded-xl text-center shadow-md p-6 hover:shadow-lg transition">
        <h2 className="text-xl text-[#70B44A] font-semibold mb-2">Flexible Scheduling</h2>
        <p>Arrange sessions at your convenience with easy scheduling options.</p>
      </div>

      <div className="bg-[#FBFDF7] rounded-xl text-center shadow-md p-6 hover:shadow-lg transition">
        <h2 className="text-xl text-[#70B44A] font-semibold mb-2">Secure & Transparent Platform</h2>
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
