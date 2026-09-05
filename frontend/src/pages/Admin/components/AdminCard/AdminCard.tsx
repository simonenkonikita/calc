// frontend/src/components/admin/AdminCard.tsx

import React, { ReactNode } from "react";
import StatusBadge from "../StatusBadge/StatusBadge";
import ActionButtons from "../ActionButtons/ActionButtons";
import "./AdminCard.css";

export interface AdminCardItem {
  id: string;
  title: string;
  subtitle?: string;
  status: boolean;
  details: Array<{
    label: string;
    value: ReactNode;
    className?: string;
  }>;
  actions: Array<{
    icon: string;
    onClick: () => void;
    variant?: "primary" | "success" | "danger" | "warning" | "secondary";
    title?: string;
  }>;
  footer?: ReactNode;
  expandedContent?: ReactNode;
  onExpand?: () => void;
  isExpanded?: boolean;
}

export interface AdminCardProps {
  item: AdminCardItem;
  size?: "sm" | "md" | "lg";
  className?: string;
  statusActiveText?: string;
  statusInactiveText?: string;
}

export const AdminCard: React.FC<AdminCardProps> = ({
  item,
  size = "md",
  className = "",
  statusActiveText = "Активен",
  statusInactiveText = "Неактивен",
}) => {
  const sizeClasses = {
    sm: "admin-card-sm",
    md: "admin-card-md",
    lg: "admin-card-lg",
  };

  return (
    <div className={`admin-card ${sizeClasses[size]} ${className}`}>
      {/* Заголовок карточки */}
      <div className="admin-card-header">
        <div className="admin-card-title">
          <span className="admin-card-title-text">{item.title}</span>
          {item.subtitle && (
            <span className="admin-card-subtitle">{item.subtitle}</span>
          )}
        </div>
        <div className="admin-card-actions-right">
          <StatusBadge
            isActive={item.status}
            activeText={statusActiveText}
            inactiveText={statusInactiveText}
          />
          <ActionButtons buttons={item.actions} size="sm" gap="sm" />
        </div>
      </div>

      {/* Тело карточки */}
      <div className="admin-card-body">
        <div className="admin-card-details">
          {item.details.map((detail, index) => (
            <div key={index} className="admin-card-detail-item">
              <span className="admin-card-detail-label">{detail.label}:</span>
              <span
                className={`admin-card-detail-value ${detail.className || ""}`}
              >
                {detail.value}
              </span>
            </div>
          ))}
        </div>

        {/* Дополнительный контент (например, ЖК) */}
        {item.expandedContent && (
          <div className="admin-card-expanded">
            {item.onExpand && (
              <button className="admin-card-expand-btn" onClick={item.onExpand}>
                {item.isExpanded ? "🔼 Скрыть" : "🔽 Показать"} подробности
              </button>
            )}
            {item.isExpanded && (
              <div className="admin-card-expanded-content">
                {item.expandedContent}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Футер карточки */}
      {item.footer && <div className="admin-card-footer">{item.footer}</div>}
    </div>
  );
};

export default AdminCard;
