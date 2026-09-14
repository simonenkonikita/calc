// src/components/common/Loader/Loader.tsx

import React from "react";
import "./Loader.css";

interface LoaderProps {
  size?: "small" | "medium" | "large";
  text?: string;
  fullPage?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  size = "medium",
  text,
  fullPage = false,
}) => {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 56,
  };

  const pixelSize = sizeMap[size];

  return (
    <div className={`loader-container ${fullPage ? "full-page" : ""}`}>
      <div className="loader">
        <div
          className="loader-spinner"
          style={{
            width: pixelSize,
            height: pixelSize,
          }}
        />
        {text && <p className="loader-text">{text}</p>}
      </div>
    </div>
  );
};

export default Loader;
