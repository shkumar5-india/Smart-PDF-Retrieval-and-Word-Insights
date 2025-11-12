import React, { useState, useCallback } from 'react';
import PDFWithPopup from './PDFWithPopup';

const PDFApp = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
      setFileName(droppedFile.name);
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 px-4">
      {!file ? (
        <div
          className={`w-full max-w-lg p-10 border-2 border-dashed rounded-xl transition-all duration-300
            ${isDragging ? 'border-blue-400 bg-blue-100/30' : 'border-gray-300 bg-white/10'}
            backdrop-blur-md shadow-xl cursor-pointer`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-center text-gray-700">
            
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 12l-4-4m0 0l-4 4m4-4v12"
              />
            </svg>

            <p className="text-xl font-semibold">Drag & Drop your PDF here</p>
            <p className="text-sm text-gray-600">or</p>
            <label className="cursor-pointer px-4 py-2 bg-white/20 border border-gray-200 rounded-md shadow-sm hover:bg-white/30 transition">
              <span className="text-sm font-medium text-gray-800">Choose a file</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            
            {fileName && (
              <p className="text-sm mt-2 text-gray-500">
                Selected: <span className="font-medium text-gray-700">{fileName}</span>
              </p>
            )}
          </div>
        </div>
      ) : (
        <PDFWithPopup file={file} handleFileChange={handleFileChange} />
      )}
    </div>
  );
};

export default PDFApp;

