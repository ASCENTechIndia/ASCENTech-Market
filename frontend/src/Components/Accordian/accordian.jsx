// Accordion.js
import React, { useState } from "react";

import "./accordian.css";

const Accordion = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="accordion">
      <div className="accordionHeading" onClick={toggleAccordion}>
        <div className="container">
          <span>{title}</span>
          <i className={`arrow ${isOpen ? "up" : "down"}`}></i>
        </div>
      </div>
      <div className={`accordionContent ${isOpen ? "show" : ""}`}>
        <div className="container">
          <span>{content}</span>
        </div>
      </div>
    </div>
  );
};

export default Accordion;
