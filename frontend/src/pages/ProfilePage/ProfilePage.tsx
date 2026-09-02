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

  if (!user)
    return (
      <div className="profile-page">
        <div className="profile-container">
          <p>Загрузка...</p>
        </div>
      </div>
    );

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>👤 Профиль</h1>
          <button onClick={handleLogout} className="logout-btn-profile">
            🚪 Выйти
          </button>
        </div>

        {message && (
          <div className={`profile-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="profile-card">
          <div className="profile-card-header">
            <h2>Основная информация</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="edit-btn"
            >
              {isEditing ? "✕ Отмена" : "✏️ Редактировать"}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={user.email} disabled />
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
                />
              </div>
              <button type="submit" className="save-btn">
                💾 Сохранить
              </button>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Имя</span>
                <span className="info-value">{user.firstName || "—"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Фамилия</span>
                <span className="info-value">{user.lastName || "—"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Телефон</span>
                <span className="info-value">{user.phone || "—"}</span>
              </div>
            </div>
          )}
        </div>

        <div className="profile-card">
          <h2>🔐 Безопасность</h2>
          <div className="profile-card-header">
            <div></div>
            <button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="edit-btn"
            >
              {isChangingPassword ? "✕ Отмена" : "🔄 Сменить пароль"}
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
                />
              </div>
              <button type="submit" className="save-btn">
                🔑 Сменить пароль
              </button>
            </form>
          ) : (
            <p className="password-hint">
              Для смены пароля нажмите кнопку "Сменить пароль"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
