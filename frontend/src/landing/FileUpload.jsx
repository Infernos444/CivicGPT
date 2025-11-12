import React from 'react';
import './FileUpload.css';

const FileUpload = ({ label, onFileSelect, fileType }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="file-upload-container">
      <label className="file-upload-label">{label}</label>
      <div className="file-upload-box">
        <input 
          type="file" 
          accept={fileType === 'pdf' ? '.pdf' : '.pdf,.png,.jpg,.jpeg'}
          onChange={handleFileChange}
          className="file-input"
        />
        <div className="upload-placeholder">
          📁 Click to upload {fileType === 'pdf' ? 'PDF' : 'PDF or Image'}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;