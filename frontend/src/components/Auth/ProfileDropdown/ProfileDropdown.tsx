// frontend/src/components/Auth/ProfileDropdown.tsx
import React from "react";

import "./ProfileDropdown.css";
import { AuthUser } from "../../../types/auth.types";
import { useAuthExtended } from "../../../hooks/ui/useAuth";

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
  // 🔥 Используем расширенный хук для получения методов работы с ролями
  const { getRoleLabel, getRoleColor } = useAuthExtended();

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

  // 🔥 Используем методы из хука вместо локальных функций
  const roleLabel = user?.role ? getRoleLabel(user.role) : null;
  const roleColor = user?.role ? getRoleColor(user.role) : "#6b7280";

  return (
    <div className="profile-dropdown">
      {/* Шапка с аватаром */}
      <div className="dropdown-header">
        <div
          className="dropdown-avatar"
          style={{
            background: `linear-gradient(135deg, ${roleColor}, ${roleColor}dd)`,
          }}
        >
          <span className="dropdown-avatar-text">{getInitials()}</span>
        </div>
        <div className="dropdown-user-info">
          <div className="dropdown-user-name">{getFullName()}</div>
          <div className="dropdown-user-email">{user?.email}</div>
          {user?.role && roleLabel && (
            <span
              className="dropdown-user-role"
              style={{ backgroundColor: roleColor }}
            >
              {roleLabel}
            </span>
          )}
        </div>
      </div>

      {/* Разделитель */}
      <div className="dropdown-divider"></div>

      {/* Пункты меню */}
      <div className="dropdown-menu">
        <button onClick={onProfile} className="dropdown-item">
          <span className="dropdown-item-icon">👤</span>
          <span className="dropdown-item-text">Профиль</span>
        </button>
        <button onClick={onLogout} className="dropdown-item logout">
          <span className="dropdown-item-icon">🚪</span>
          <span className="dropdown-item-text">Выйти</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
