import React from "react";
import { Link } from "react-router-dom";

const NavDropdown = ({ title, items }) => {
  if (!items || items.length === 0) return null; // Hide empty dropdowns

  return (
    <li className="nav-item dropdown">
      <button 
        className="nav-link dropdown-toggle" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
      >
        {title}
      </button>
      <ul className="dropdown-menu">
        {items.map((item, index) => (
          <li key={index}>
            {item.path ? (
              <Link className="dropdown-item" to={item.path}>
                {item.text}
              </Link>
            ) : (
              <span className="dropdown-item disabled">{item.text}</span>
            )}
          </li>
        ))}
      </ul>
    </li>
  );
};

export default NavDropdown;
