// frontend/src/components/Auth/ProfileDropdown.tsx
import React from "react";

import "./ProfileDropdown.css";
import { AuthUser } from "../../../types/auth.types";

interface ProfileDropdownProps {
  user: AuthUser | null;
  onProfile: () => void;
  onLogout: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  onProfile,
  onLogout,
}) => {
  const getInitials = (): string => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    if (user?.firstName) {
      return user.firstName[0];
    }
    return user?.email?.[0] || "U";
  };

  const getFullName = (): string => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    return user?.email || "Пользователь";
  };

  const getRoleLabel = (role: string): string => {
    const roles: Record<string, string> = {
      admin: "Администратор",
      developer_admin: "Администратор застройщика",
      developer_manager: "Менеджер застройщика",
      agent: "Агент",
    };
    return roles[role] || role;
  };

  const getRoleColor = (role: string): string => {
    const colors: Record<string, string> = {
      admin: "#ef4444",
      developer_admin: "#8b5cf6",
      developer_manager: "#3b82f6",
      agent: "#10b981",
    };
    return colors[role] || "#6b7280";
  };

  return (
    <div className="profile-dropdown">
      {/* Шапка с аватаром */}
      <div className="dropdown-header">
        <div className="dropdown-avatar">
          <span className="dropdown-avatar-text">{getInitials()}</span>
        </div>
        <div className="dropdown-user-info">
          <div className="dropdown-user-name">{getFullName()}</div>
          <div className="dropdown-user-email">{user?.email}</div>
          {user?.role && (
            <span
              className="dropdown-user-role"
              style={{ backgroundColor: getRoleColor(user.role) }}
            >
              {getRoleLabel(user.role)}
            </span>
          )}
        </div>
      </div>

      {/* Разделитель */}
      <div className="dropdown-divider"></div>

      {/* Пункты меню */}
      <div className="dropdown-menu">
        <button onClick={onProfile} className="dropdown-item">
          <span className="dropdown-item-text">Профиль</span>
        </button>
        <button onClick={onLogout} className="dropdown-item logout">
          <span className="dropdown-item-text">Выйти</span>
        </button>
      </div>
    </div>
  );
};
