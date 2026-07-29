import React from "react";
import "./SelectAllButton.css";

interface SelectAllButtonProps {
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const SelectAllButton: React.FC<SelectAllButtonProps> = ({
  onClick,
  className = "",
  children = "Выбрать все",
}) => {
  return (
    <button className={`select-all-btn ${className}`} onClick={onClick}>
      <span className="btn-icon">✅</span> {children}
    </button>
  );
};
