import React from 'react';
import './InputField_formNo.css'; 

const InputFieldFormNo = ({ type = "text", placeholder }) => {
  return (
    <input className="input-field" type={type} placeholder={placeholder} />
  );
};

export default InputFieldFormNo;
