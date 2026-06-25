import React from "react";
import { useLoader } from "../../Context/LoaderContext";
import "./Spinner.css"; // Optional styling

const Spinner = () => {
  const { loading } = useLoader();

  if (!loading) return null;

  return (
    <div className="spinner-overlay">
      <div className="spinner" />
    </div>
  );
};

export default Spinner;