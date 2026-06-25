import React from "react";

const NavbarLogo = ({ src }) => {
  if (!src) return null; // Do not render if no logo URL is available

  const logoStyle = {
    width: "100px", // Adjust the size as needed
    height: "auto", // Maintain aspect ratio
    overflow: "hidden", // Ensure it stays within the boundary
  };

  const imageStyle = {
    width: "100%", // Make sure the image fits within the container
    height: "auto%", // Maintain aspect ratio
  };
  return (
    <div style={logoStyle}>
      {" "}
      <img src={src} alt="Logo" style={imageStyle} />
    </div>
  );
};

export default NavbarLogo;
