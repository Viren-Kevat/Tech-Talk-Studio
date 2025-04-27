import React from "react";
import { RingLoader } from "react-spinners";
import "./Loader.css"; // Custom CSS for the loader

const Loader = ({ loading, size = 50, color = "#000000" }) => {
  // Color set to black for monochrome theme
  return (
    <div className="loader-container">
      <RingLoader loading={loading} size={size} color={color} />
    </div>
  );
};

export default Loader;
