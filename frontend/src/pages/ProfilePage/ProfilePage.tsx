// frontend/src/pages/ProfilePage/ProfilePage.tsx
import React, { useState } from "react";

import "./ProfilePage.css";
import { useAuth } from "../../hooks/ui/useAuth";

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    position: user?.position || "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const success = await updateProfile(formData);
    if (success) {
      setMessage({ text: "✅ Профиль успешно обновлен!", type: "success" });
      setIsEditing(false);
    } else {
      setMessage({ text: "❌ Ошибка обновления профиля", type: "error" });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: "❌ Пароли не совпадают", type: "error" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({
        text: "❌ Пароль должен быть не менее 6 символов",
        type: "error",
      });
      return;
    }

    const success = await changePassword(
      passwordData.oldPassword,
      passwordData.newPassword,
    );
    if (success) {
      setMessage({ text: "✅ Пароль успешно изменен!", type: "success" });
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
    } else {
      setMessage({ text: "❌ Ошибка смены пароля", type: "error" });
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (): string => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    if (user?.firstName) {
      return user.firstName[0];
    }
    return user?.email?.[0] || "U";
  };

  const getRoleLabel = (role: string): string => {
    const roles: Record<string, string> = {
      admin: "Администратор проекта",
      developer_admin: "Администратор застройщика",
      developer_manager: "Менеджер застройщика",
      agent: "Агент",
    };
    return roles[role] || role;
  };

  const getRoleColor = (role: string): string => {
    const colors: Record<string, string> = {
      admin: "var(--role-admin)",
      developer_admin: "var(--role-developer-admin)",
      developer_manager: "var(--role-developer-manager)",
      agent: "var(--role-agent)",
    };
    return colors[role] || "var(--role-default)";
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Hero секция профиля */}
        <div className="profile-hero">
          <div className="profile-hero-content">
            <div className="profile-avatar-large">
              <span className="profile-avatar-text">{getInitials()}</span>
            </div>
            <div className="profile-hero-info">
              <h1 className="profile-hero-name">
                {user.firstName || user.lastName
                  ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                  : user.email}
              </h1>
              <p className="profile-hero-email">{user.email}</p>
              <div className="profile-hero-badge">
                <span
                  className="profile-role-badge"
                  style={{ backgroundColor: getRoleColor(user.role) }}
                >
                  {getRoleLabel(user.role)}
                </span>
                {user.company && (
                  <span className="profile-company-badge">
                    🏢 {user.company}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className={`profile-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Основная информация */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-card-title">
              <span className="card-icon">👤</span>
              <h2>Основная информация</h2>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="profile-edit-btn"
            >
              {isEditing ? (
                <>
                  <span>✕</span> Отмена
                </>
              ) : (
                <>
                  <span>✏️</span> Редактировать
                </>
              )}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label>Email</label>
                <div className="form-input-disabled">{user.email}</div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Имя</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder="Введите имя"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Фамилия</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    placeholder="Введите фамилию"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Телефон</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+7 (999) 123-45-67"
                  className="form-input"
                />
              </div>
              {user.position !== undefined && (
                <div className="form-group">
                  <label>Должность</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    placeholder="Введите должность"
                    className="form-input"
                  />
                </div>
              )}
              <button type="submit" className="profile-save-btn">
                💾 Сохранить изменения
              </button>
            </form>
          ) : (
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-info-label">📧 Email</span>
                <span className="profile-info-value">{user.email}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">👤 Имя</span>
                <span className="profile-info-value">
                  {user.firstName || "—"}
                </span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">👤 Фамилия</span>
                <span className="profile-info-value">
                  {user.lastName || "—"}
                </span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">📱 Телефон</span>
                <span className="profile-info-value">{user.phone || "—"}</span>
              </div>
              {user.position && (
                <div className="profile-info-item">
                  <span className="profile-info-label">💼 Должность</span>
                  <span className="profile-info-value">{user.position}</span>
                </div>
              )}
              {user.company && (
                <div className="profile-info-item">
                  <span className="profile-info-label">🏢 Компания</span>
                  <span className="profile-info-value">{user.company}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Безопасность */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-card-title">
              <span className="card-icon">🔐</span>
              <h2>Безопасность</h2>
            </div>
            <button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="profile-edit-btn"
            >
              {isChangingPassword ? (
                <>
                  <span>✕</span> Отмена
                </>
              ) : (
                <>
                  <span>🔄</span> Сменить пароль
                </>
              )}
            </button>
          </div>

          {isChangingPassword ? (
            <form onSubmit={handlePasswordChange} className="profile-form">
              <div className="form-group">
                <label>Старый пароль</label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      oldPassword: e.target.value,
                    })
                  }
                  placeholder="Введите старый пароль"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Новый пароль</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Минимум 6 символов"
                  required
                  minLength={6}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Подтвердите пароль</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Подтвердите пароль"
                  required
                  className="form-input"
                />
              </div>
              <button type="submit" className="profile-save-btn">
                🔑 Сменить пароль
              </button>
            </form>
          ) : (
            <div className="profile-security-info">
              <div className="security-item">
                <span className="security-icon">🔒</span>
                <div className="security-content">
                  <div className="security-title">Пароль защищен</div>
                  <div className="security-description">
                    Ваш пароль хранится в зашифрованном виде. Рекомендуем менять
                    пароль каждые 3 месяца.
                  </div>
                </div>
              </div>
              <div className="security-item">
                <span className="security-icon">🛡️</span>
                <div className="security-content">
                  <div className="security-title">
                    Двухфакторная аутентификация
                  </div>
                  <div className="security-description">
                    Подключите дополнительную защиту для вашего аккаунта.
                  </div>
                </div>
                <button className="security-btn">Настроить</button>
              </div>
            </div>
          )}
        </div>

        {/* Статистика */}
        <div className="profile-stats">
          <div className="stat-card">
            <span className="stat-emoji">📅</span>
            <div className="stat-info">
              <span className="stat-number">В разработке</span>
              <span className="stat-label">Дата регистрации</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-emoji">🏠</span>
            <div className="stat-info">
              <span className="stat-number">0</span>
              <span className="stat-label">Расчетов выполнено</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-emoji">⭐</span>
            <div className="stat-info">
              <span className="stat-number">0</span>
              <span className="stat-label">Избранных программ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
