import React, { useState } from "react";
import { useFormikContext } from "formik";
import "./FileUpload.css";

const FileUpload = ({ disabled, name = "file", multiple = false }) => {
  const { setFieldValue, setFieldTouched, setFieldError, values } =
    useFormikContext();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileError, setFileError] = useState("");

  // Validate file size and type
  // const validateFile = (file) => {
  //   const fileSizeKB = file.size / 1024; // Convert bytes to KB
  //   const fileExtension = file.name.split(".").pop().toUpperCase();

  //   // // Validate file size (max 10 KB)
  //   // if (fileSizeKB > 10) {
  //   //   setFileError("Image size should be less than 10 KB");
  //   //   return false;
  //   // }

  //   // // Validate file type (only PNG allowed)
  //   // if (fileExtension !== "PNG") {
  //   //   setFileError("Image should be in .PNG format only");
  //   //   return false;
  //   // }

  //   return true;
  // };

  // Validate file type
  const validateFile = (file) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const allowedExtensions = ["jpeg", "jpg", "png"];

    if (
      !allowedTypes.includes(file.type) ||
      !allowedExtensions.includes(fileExtension)
    ) {
      setFileError("फक्त JPEG, JPG किंवा PNG फाईल्स परवान्य आहेत.");
      return false;
    }

    // Optional: Validate file size (e.g., < 2MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 2) {
      setFileError("फाईल साईज 2MB पेक्षा कमी असावी.");
      return false;
    }

    setFileError("");
    return true;
  };

  // Handle file change
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);

    if (files.length > 0) {
      const validFiles = [];

      // Validate each file before adding it
      files.forEach((file) => {
        if (validateFile(file)) {
          validFiles.push(file);
        }
      });

      if (validFiles.length > 0) {
        setSelectedFiles(validFiles);
        setFieldValue(name, multiple ? validFiles : validFiles[0]);
        setFieldTouched(name, true);
        setFieldError(name, ""); // Clear error if file is valid
      }
      event.target.value = ""; // Reset input to allow re-selection
    }
  };

  // Handle file removal
  const handleFileRemove = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setFieldValue(
      name,
      updatedFiles.length ? updatedFiles : multiple ? [] : ""
    );
    if (updatedFiles.length === 0) setFieldError(name, "File is required"); // Show error if no file
  };

  return (
    <div className="file-upload-container">
      <div className="file-upload-box">
        <label className="upload-button">
          Choose {multiple ? "Files" : "File"}
          <input
            type="file"
            accept="image/png"
            multiple={multiple}
            onChange={handleFileChange}
            className="hidden-input"
            disabled={disabled}
          />
        </label>
      </div>

      {selectedFiles.length > 0 ? (
        <div className="file-info-container">
          {selectedFiles.map((file, index) => (
            <div key={index} className="file-item">
              <span className="file-name">{file.name}</span>
              {/* <button type="button" onClick={() => handleFileRemove(index)} className="remove-file-button">
                Remove
              </button> */}
            </div>
          ))}
        </div>
      ) : (
        <span className="no-file-text">No file chosen</span>
      )}

      {/* Show error message if validation fails */}
      {fileError && <div className="text-danger mt-2">{fileError}</div>}
    </div>
  );
};

export default FileUpload;
