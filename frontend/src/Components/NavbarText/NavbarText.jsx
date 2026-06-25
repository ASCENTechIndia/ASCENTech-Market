import "./NavbarText.css";
import PropTypes from "prop-types";

const NavbarText = ({ text1, text2 }) => {
  return (
    <div className="navbar-text">
      <span className="navbar-text1">{text1}</span>
      <span className="navbar-text2">{text2}</span>
    </div>
  );
};

NavbarText.propTypes = {
  text1: PropTypes.string.isRequired,
  text2: PropTypes.string.isRequired,
};

export default NavbarText;
