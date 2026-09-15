import React from "react";

export interface ActionButton {
  icon: string;
  onClick: () => void;
  variant?: "primary" | "success" | "danger" | "warning" | "secondary" | "info";
  title?: string;
  disabled?: boolean;
  size?: "xs" | "sm" | "md";
}

export interface ActionButtonsProps {
  buttons: ActionButton[];
  className?: string;
  size?: "xs" | "sm" | "md";
  gap?: "xs" | "sm" | "md" | "lg";
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  buttons,
  className = "",
  size = "sm",
  gap = "sm",
}) => {
  const sizeClasses = {
    xs: "admin-btn-xs",
    sm: "admin-btn-sm",
    md: "admin-btn-md",
  };

  const gapClasses = {
    xs: "admin-actions-gap-xs",
    sm: "admin-actions-gap-sm",
    md: "admin-actions-gap-md",
    lg: "admin-actions-gap-lg",
  };

  return (
    <div className={`admin-actions ${gapClasses[gap]} ${className}`}>
      {buttons.map((btn, index) => (
        <button
          key={index}
          onClick={btn.onClick}
          disabled={btn.disabled}
          title={btn.title || btn.icon}
          className={`admin-btn admin-btn-${btn.variant || "primary"} ${
            sizeClasses[size]
          }`}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
};

export default ActionButtons;
