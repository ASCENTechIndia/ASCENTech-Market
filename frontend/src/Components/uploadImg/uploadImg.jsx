import React, { useState } from "react";
import "./uploadImg.css"; // Keep your existing styles
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap is imported

const UploadImg = ({ disabled, icon: Icon, labelText, fileTypeText, buttonLabel, onFileUpload, previewImage }) => {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const uniqueId = `file-upload-${Math.random().toString(36).substr(2, 9)}`; // Generate a unique ID

  // Handle file upload
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const fileType = selectedFile.type;
      if (!["image/png", "image/jpeg"].includes(fileType)) {
        setError("Only PNG and JPEG files are allowed.");
        setFile(null);
        setImagePreview(null);
        onFileUpload(null); // Inform parent that no valid file is selected
        return;
      }

      // Clear any previous error
      setError(null);
      setFile(selectedFile);

      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);

      // Inform parent (Formik) about the uploaded file
      onFileUpload(selectedFile);
    }
  };

  return (
    <div className="container upload-container">
      <div className="row align-items-center upload-wrapper">
        {/* Image Section */}
        <div className="col-md-6 image-section">
          <div className="upload-img">
            <div className="pandit-chayachitra">{fileTypeText}</div>

            <div className="rectangle-9"></div>
            <div className="rectangle-10"></div>

            {/* Image Preview */}
            <div className="image-preview d-flex justify-content-center align-items-center">
  {(imagePreview || previewImage) ? (
    <img src={imagePreview || previewImage} alt="preview" />
  ) : (
    Icon && <Icon size={50} color="#58707E" />
  )}
</div>


          </div>
        </div>

        {/* Text & Button Section */}
        <div className="col-md-6 text-button-section">
          <div className="text-section">
            <div className="click-photo">{labelText}</div>
            <div className="no-file-chosen">{file ? file.name : "No file chosen"}</div>
            {error && <p className="error-message text-danger">{error}</p>}
          </div>

          {/* File Upload Button */}
          <div className="frame-7">
            <input
              type="file"
              accept="image/png, image/jpeg"
              id={uniqueId} // Assign unique ID
              onChange={handleFileChange}
              style={{ display: "none" }}
              disabled={disabled}
            />
            <label htmlFor={uniqueId} className="choose-file btn btn-primary">
              {buttonLabel || "Choose File"}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadImg;