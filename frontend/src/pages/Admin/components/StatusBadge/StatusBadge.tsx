import React from "react";

export interface StatusBadgeProps {
  isActive: boolean;
  activeText?: string;
  inactiveText?: string;
  activeIcon?: string;
  inactiveIcon?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  isActive,
  activeText = "Активен",
  inactiveText = "Неактивен",
  activeIcon = "✅",
  inactiveIcon = "❌",
  size = "sm",
  className = "",
}) => {
  const sizeClasses = {
    sm: "admin-badge-sm",
    md: "admin-badge-md",
    lg: "admin-badge-lg",
  };

  const badgeClass = isActive
    ? `admin-badge admin-badge-success ${sizeClasses[size]} ${className}`
    : `admin-badge admin-badge-danger ${sizeClasses[size]} ${className}`;

  const icon = isActive ? activeIcon : inactiveIcon;
  const text = isActive ? activeText : inactiveText;

  return (
    <span className={badgeClass}>
      {icon} {text}
    </span>
  );
};

export default StatusBadge;
