import React from 'react';
import './TableRow.css';

const TableRow = ({ index, name, certificateNumber, onDownload }) => {
  return (
    <div className="table-row">
      <div className="table-cell rect">{index}</div>
      <div className="table-cell rect">{name}</div>
      <div className="table-cell rect">{certificateNumber}</div>
      <div className="table-cell rect">
        <button className="download-btn" onClick={onDownload}>Download</button>
      </div>
    </div>
  );
};

export default TableRow;
