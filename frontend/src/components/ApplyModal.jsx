import React, { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ApplyModal = ({ post, isOpen, onClose, onSubmit }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef(null);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
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

  // Handle escape key
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
    setError('');

    try {
      await onSubmit(post.id, message);
      setMessage('');
      onClose();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error('Application failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
      <div 
        ref={modalRef}
        className="bg-[#FBFDF6] rounded-lg shadow-2xl p-6 w-full max-w-md border border-gray-200"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold"><span className="text-[#70B44A]">Apply</span> Tuition</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
            type="button"
          >
            <FaTimes className="hover:cursor-pointer" />
          </button>
        </div>

        {/* Post Details */}
        <div className="p-4 rounded-md mb-4 border border-gray-200">
          <div className='flex justify-between mb-2'>
            <h3 className="font-semibold text-[#70B44A]">
              {post.class_level}
            </h3>
            <h3 className="font-semibold text-[#70B44A]">
              {post.gender}
            </h3>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Salary:</span> ৳{post.salary}</p>
            <p><span className="font-medium">Subject:</span> {post.subject}</p>
            <p><span className="font-medium">Location:</span> {post.location}</p>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and explain why you're suitable for this tutoring position..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#70B44A]"
              rows="4"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

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
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyModal;