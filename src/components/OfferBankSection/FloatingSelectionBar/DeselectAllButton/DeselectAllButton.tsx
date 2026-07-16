// src/components/DeselectAllButton/DeselectAllButton.tsx
import React from "react";
import "./DeselectAllButton.css";

interface DeselectAllButtonProps {
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const DeselectAllButton: React.FC<DeselectAllButtonProps> = ({
  onClick,
  className = "",
  children = "Снять все",
}) => {
  return (
    <button className={`deselect-all-btn ${className}`} onClick={onClick}>
      <span className="btn-icon">❌</span> {children}
    </button>
  );
};
