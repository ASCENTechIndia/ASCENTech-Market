import React, { useState, useEffect } from "react";
import "./Table.css";
import { useNavigate } from "react-router-dom";
import FileUpload from "../FileUpload/FileUpload";
import InputField from "../../Components/InputField/InputField";
import { Field } from "formik"; // Keep if InputField uses Formik's Field internally or for consistency
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const Table = ({
  headers = [],
  data = [], // 'data' already contains the 'checked' property from FrmTradeCategoryConfig
  keyMapping = {},
  onCheckboxChange,
  onRadioChange,
  onDownload,
  onInputChange,
  onFileUpload,
  onSelectAllChange, // For header checkbox
  showCheckboxInHeader = true,
  noDataMessage,
  checkboxIdentifier, // This prop is crucial to identify the unique item for checkbox changes
  customRenderers = {},
}) => {
  const navigate = useNavigate();
  // REMOVED: const [checkedRows, setCheckedRows] = useState({}); // This state is no longer needed

  const [base64Images, setBase64Images] = useState({});

  const BASE_URL = `${API_BASE_URL}`;

  // Calculate isAllChecked directly from the 'checked' property in the 'data' prop
  // This ensures the header checkbox reflects the state of the data passed from the parent
  const isAllChecked = data.length > 0 && data.every((row) => row.checked);

  useEffect(() => {
    // This useEffect is now solely for image base64 conversion and should not touch checkbox state.
    // The parent component (FrmTradeCategoryConfig) is responsible for providing the `checked` status
    // within the `data` prop, which then directly controls the checkboxes via `checked={row.checked}`.
    data.forEach((row) => {
      // Prioritize explicit documentId, then NUM_DOCUMENT_ID, then the generic checkboxIdentifier
      const currentDocumentId =
        row.documentId || row.NUM_DOCUMENT_ID || row[checkboxIdentifier];
      if (currentDocumentId) {
        // Only attempt if a valid ID exists
        ["ulbImage", "ulbReportImage"].forEach((key) => {
          if (
            row[key] &&
            (!base64Images[currentDocumentId] ||
              !base64Images[currentDocumentId][key])
          ) {
            convertImageToBase64(row[key], currentDocumentId, key);
          }
        });
      }
    });
  }, [data, base64Images, checkboxIdentifier]); // Add checkboxIdentifier to deps if documentId fallback uses it

  const convertImageToBase64 = async (imagePath, documentId, key) => {
    try {
      const response = await fetch(BASE_URL + imagePath);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        setBase64Images((prev) => ({
          ...prev,
          [documentId]: {
            ...prev[documentId],
            [key]: base64data,
          },
        }));
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error converting image to base64:", error);
    }
  };

  // Handler for the header (Select All) checkbox
  const handleHeaderCheckboxChange = (isChecked) => {
    if (onSelectAllChange) {
      // If a specific handler for select all is provided, use it
      onSelectAllChange(isChecked);
    } else if (onCheckboxChange) {
      // Fallback: If onSelectAllChange is not provided, iterate and call onCheckboxChange for each item
      data.forEach((row) => {
        const id = row[checkboxIdentifier]; // Get the unique ID from the row
        if (id !== undefined) {
          onCheckboxChange(id, "checked", isChecked);
        }
      });
    }
  };

  // Handler for individual row checkboxes
  const handleRowCheckboxChange = (row) => {
    const id = row[checkboxIdentifier]; // Get the unique ID for the item
    // Calculate the new checked state based on the current 'checked' prop value
    const newCheckedState = !row.checked;
    if (onCheckboxChange && id !== undefined) {
      // Notify the parent (FrmTradeCategoryConfig) about the change
      onCheckboxChange(id, "checked", newCheckedState);
    }
  };

  return (
    <div className="table-container">
      <table className="table table-bordered">
        <thead className="custom-thead">
          <tr>
            {headers.map((header, index) => {
              const key = keyMapping[header];

              if (key === "checked" && showCheckboxInHeader) {
                return (
                  <th key={index} className="table-header">
                    <input
                      type="checkbox"
                      checked={isAllChecked} // Controlled by parent's data prop
                      onChange={(e) =>
                        handleHeaderCheckboxChange(e.target.checked)
                      }
                    />
                  </th>
                );
              }

              return (
                <th key={index} className="table-header">
                  {header}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => {
              // Ensure a stable key for each row; prioritize unique IDs
              const uniqueRowId =
                row.documentId ||
                row.NUM_DOCUMENT_ID ||
                row[checkboxIdentifier] ||
                rowIndex;
              // The checked state for this row comes directly from the 'row.checked' prop
              const rowChecked = row.checked || false;

              // Ensure documentId is determined correctly for other purposes within the row mapping
              const currentDocumentId =
                row.documentId ||
                row.NUM_DOCUMENT_ID ||
                row[checkboxIdentifier];

              return (
                <tr key={uniqueRowId} className="table-row">
                  {headers.map((header, colIndex) => {
                    const key = keyMapping[header];

                    // Checkbox column rendering for 'checked', 'approved', 'rejected'
                    if (
                      key === "checked" ||
                      key === "approved" ||
                      key === "rejected"
                    ) {
                      return (
                        <td key={colIndex} className="table-cell">
                          <input
                            type="checkbox"
                            checked={rowChecked} // THIS IS NOW CONTROLLED SOLELY BY PARENT'S 'data' PROP
                            onChange={() => handleRowCheckboxChange(row)} // Pass the whole row object
                          />
                        </td>
                      );
                    }

                    // Image columns
                    if (key === "ulbImage" || key === "ulbReportImage") {
                      const imageBase64 = currentDocumentId
                        ? base64Images[currentDocumentId]?.[key]
                        : null;
                      const imageSrc =
                        imageBase64 || (row[key] ? BASE_URL + row[key] : null);
                      return (
                        <td key={colIndex} className="table-cell">
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt="ULB Image"
                              style={{
                                width: "50px",
                                height: "50px",
                                marginLeft: "20px",
                              }}
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                      );
                    }

                    // Button for "updateStatus"
                    if (key === "updateStatus") {
                      return (
                        <td key={colIndex} className="table-cell">
                          <button
                            className="download-button"
                            onClick={() =>
                              navigate(
                                "/Pages/Marriage/FrmVaivahikStithiyadi/FrmVaivahikStithiyadi",
                                { state: { data: row } }
                              )
                            }
                          >
                            Select
                          </button>
                        </td>
                      );
                    }

                    // Radio button for "select"
                    if (key === "select") {
                      return (
                        <td key={colIndex} className="table-cell">
                          <input
                            type="radio"
                            name="selectedRow"
                            checked={row.isSelected || false} // Use row.isSelected from prop
                            onChange={() =>
                              onRadioChange && onRadioChange(currentDocumentId)
                            }
                          />
                        </td>
                      );
                    }

                    // Link for "updateLink"
                    if (key === "updateLink") {
                      return (
                        <td key={colIndex} className="table-cell">
                          <a
                            className="update-button"
                            onClick={() => navigate(row.updateLink)}
                          >
                            {row.updateLabel || "Edit"}
                          </a>
                        </td>
                      );
                    }

                    // Download buttons
                    if (
                      [
                        "viewDownload",
                        "certificateDownload",
                        "viewDocument",
                      ].includes(key)
                    ) {
                      return (
                        <td key={colIndex} className="table-cell">
                          <button
                            className="download-button"
                            onClick={() => onDownload && onDownload(row, key)}
                          >
                            {["viewDownload", "viewDocument"].includes(key)
                              ? "Download"
                              : "डाऊनलोड करा"}
                          </button>
                        </td>
                      );
                    }

                    // Input fields for "volume" or "serial"
                    if (key === "volume" || key === "serial") {
                      return (
                        <td key={colIndex} className="table-cell">
                          <input
                            type="text"
                            value={row[key] || ""} // Value from prop
                            onChange={(e) =>
                              onInputChange &&
                              onInputChange(
                                currentDocumentId,
                                key,
                                e.target.value
                              )
                            }
                            className="table-input"
                          />
                        </td>
                      );
                    }

                    // File upload for "image"
                    if (key === "image") {
                      return (
                        <td key={colIndex} className="table-cell">
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <FileUpload
                              name={`file_${currentDocumentId}`}
                              multiple={false}
                              onChange={(file) =>
                                onFileUpload(rowIndex, file, currentDocumentId)
                              }
                            />
                            {row.image && (
                              <img
                                src={row.image}
                                alt="Document Preview"
                                style={{
                                  width: "50px",
                                  height: "auto",
                                  verticalAlign: "middle",
                                }}
                              />
                            )}
                          </div>
                        </td>
                      );
                    }

                    // Formik Field for "docDetails"
                    if (key === "docDetails") {
                      return (
                        <td key={colIndex} className="table-cell">
                          <Field
                            name={`docDetails_${currentDocumentId}`} // Unique name for Formik Field
                            component={InputField}
                            value={row[key] || ""} // Ensure value is controlled by Formik via its prop
                            onChange={(e) =>
                              onInputChange &&
                              onInputChange(
                                currentDocumentId,
                                key,
                                e.target.value
                              )
                            }
                            className="table-input"
                          />
                        </td>
                      );
                    }

                    // Support custom renderers
                    if (customRenderers[header]) {
                      return (
                        <td key={colIndex} className="table-cell">
                          {customRenderers[header](row, rowIndex)}
                        </td>
                      );
                    }

                    // Default rendering
                    return (
                      <td key={colIndex} className="table-cell">
                        {row[key] !== undefined && row[key] !== null
                          ? row[key]
                          : "-"}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className="text-center text-danger"
                style={{ padding: "20px" }}
              >
                {noDataMessage || "No data available"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
