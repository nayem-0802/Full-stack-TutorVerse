import React, { useState } from 'react';
import { FaCloudUploadAlt, FaTimes, FaCheckCircle } from 'react-icons/fa';

const ImageUpload = ({ 
  onFileSelect, 
  accept = "image/*", 
  maxSize = 5, // MB
  label = "Upload Image",
  preview = true,
  currentImage = null 
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file) => {
    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size should be less than ${maxSize}MB`);
      return false;
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileType = file.type;
    const isValid = acceptedTypes.some(type => {
      if (type === 'image/*') return fileType.startsWith('image/');
      if (type === '.pdf') return fileType === 'application/pdf';
      return fileType === type;
    });

    if (!isValid) {
      setError('Invalid file type');
      return false;
    }

    setError('');
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      
      // Create preview URL for images
      if (file.type.startsWith('image/') && preview) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      }

      // Pass file to parent component
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      
      if (file.type.startsWith('image/') && preview) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      }

      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(currentImage);
    setError('');
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition ${
          isDragging 
            ? 'border-[#70B44A] bg-green-50' 
            : 'border-gray-300 hover:border-[#70B44A]'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl && preview ? (
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-h-48 mx-auto rounded-lg object-cover"
            />
            {selectedFile && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
              >
                <FaTimes />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400" />
            <div className="text-sm text-gray-600">
              <label htmlFor="file-upload" className="cursor-pointer text-[#70B44A] hover:underline">
                Click to upload
              </label>
              {' '}or drag and drop
            </div>
            <p className="text-xs text-gray-500">
              {accept === 'image/*' ? 'PNG, JPG, JPEG' : accept} (max {maxSize}MB)
            </p>
          </div>
        )}

        <input
          id="file-upload"
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
          <FaTimes />
          <span>{error}</span>
        </div>
      )}

      {selectedFile && !error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
          <FaCheckCircle />
          <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;