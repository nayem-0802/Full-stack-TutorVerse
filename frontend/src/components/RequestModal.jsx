import React, { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const RequestModal = ({ tutor, isOpen, onClose, onSubmit }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  // CHANGE: modalRef add করা হয়েছে click outside detect করার জন্য
  const modalRef = useRef(null);

  // CHANGE: Handle click outside modal - বাইরে click করলে modal close হবে
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // CHANGE: Handle escape key - Escape key press করলে modal close হবে
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.warning('Please write a message');
      return;
    }

    setLoading(true);

    try {
      await onSubmit(tutor.user_id, message);
      // toast.success('Request sent successfully!');
      setMessage('');
      onClose();
    } catch (err) {
      toast.error('Request failed');
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    // CHANGE: background opacity কমানো হয়েছে 0.15 তে যাতে background posts দেখা যায়
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
      {/* CHANGE: modalRef add করা হয়েছে */}
      <div 
        ref={modalRef}
        className="bg-[#FBFDF6] rounded-lg shadow-2xl p-6 w-full max-w-md border border-gray-200"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold"><span className="text-[#70B44A]">Send</span> Request</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
            type="button"
          >
            <FaTimes className="hover:cursor-pointer" />
          </button>
        </div>

        {/* Tutor Details */}
        <div className="p-4 rounded-md mb-4 border border-gray-200">
          <h3 className="font-semibold text-[#70B44A] mb-2">
            {tutor.first_name} {tutor.last_name}
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Address:</span> {tutor.address}</p>
          </div>
        </div>

        {/* Request Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and explain what you need help with..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
              rows="4"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#70B44A] rounded-md text-black hover:bg-[#f3fff1] hover:cursor-pointer transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#70B44A] text-white rounded-md hover:bg-[#5a983b] hover:cursor-pointer transition"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestModal;