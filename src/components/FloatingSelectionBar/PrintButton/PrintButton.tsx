// src/components/PrintButton/PrintButton.tsx
import React from "react";
import "./PrintButton.css";

interface PrintButtonProps {
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  onClick,
  className = "",
  children = "Печать",
  disabled = false,
}) => {
  return (
    <button
      className={`print-selected-btn ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      🖨️ {children}
    </button>
  );
};
