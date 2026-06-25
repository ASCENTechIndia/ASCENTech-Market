// Components/SearchBox/SearchBox.js
import React from "react";
import { Form } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import "./SearchBox.css";

const SearchBox = ({ value, onChange, placeholder, id }) => (
  <Form.Group controlId={id} className="search-box-container">
    <Form.Control
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="search-box-input"
    />
    <FaSearch className="search-box-icon" />
  </Form.Group>
);

export default SearchBox;
