import React from "react";

const TransactionTable = ({
  headers,
  data,
  keyMapping,
  renderCell,
  onRemove,
  onCheckboxChange,
}) => {
  if (!data || data.length === 0) {
    return <p>No data available.</p>;
  }

  return (
    <table className="table table-bordered table-striped">
      {" "}
      {/* Using Bootstrap classes for basic styling */}
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {headers.map((header, colIndex) => {
              const cellKey = keyMapping[header] || ""; // Get the data key based on header
              let cellContent = row[cellKey];

              // Custom rendering for specific cells
              if (renderCell && renderCell[header]) {
                cellContent = renderCell[header](row, rowIndex);
              } else if (header === "काढा" && onRemove) {
                // For "Remove" column
                cellContent = (
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => onRemove(rowIndex)}
                  >
                    Remove
                  </button>
                );
              } else if (header === "निवडा" && onCheckboxChange) {
                // For "Select" (checkbox) column
                cellContent = (
                  <input
                    type="checkbox"
                    checked={row.isSelected || false} // Assuming a property like 'isSelected' on your data
                    onChange={() => onCheckboxChange(rowIndex, row)}
                  />
                );
              }

              return <td key={colIndex}>{cellContent}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TransactionTable;
