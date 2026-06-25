import React from "react";
import { Form } from "react-bootstrap";

const Checkbox = ({ label, checked, onChange, id }) => {
  return (
    <Form.Check
      type="checkbox"
      id={id}
      label={label}
      checked={checked}
      onChange={onChange}
      className="form-check"
    />
  );
};

export default Checkbox;
