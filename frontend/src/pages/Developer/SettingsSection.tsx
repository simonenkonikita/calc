// frontend/src/pages/Developer/sections/SettingsSection.tsx

import React, { useState } from "react";

import "./SettingsSection.css";
import { useAuthExtended } from "../../hooks/ui/useAuth";
import adminApi from "../../services/adminApi";

export const SettingsSection: React.FC = () => {
  const { user, refreshUser } = useAuthExtended();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    position: user?.position || "",
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.updateProfile(formData);
      await refreshUser();
      alert("✅ Профиль обновлен!");
    } catch (error: any) {
      alert(`❌ ${error.message || "Ошибка обновления"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const oldPassword = (
      form.querySelector('[name="oldPassword"]') as HTMLInputElement
    )?.value;
    const newPassword = (
      form.querySelector('[name="newPassword"]') as HTMLInputElement
    )?.value;
    const confirmPassword = (
      form.querySelector('[name="confirmPassword"]') as HTMLInputElement
    )?.value;

    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("⚠️ Заполните все поля");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("⚠️ Пароли не совпадают");
      return;
    }

    if (newPassword.length < 6) {
      alert("⚠️ Пароль должен быть не менее 6 символов");
      return;
    }

    setLoading(true);
    try {
      await adminApi.changePassword({ oldPassword, newPassword });
      alert("✅ Пароль изменен!");
      form.reset();
    } catch (error: any) {
      alert(`❌ ${error.message || "Ошибка смены пароля"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2>⚙️ Настройки</h2>
      </div>

      <div className="settings-grid">
        {/* Профиль */}
        <div className="settings-card">
          <h3>👤 Профиль</h3>
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={user?.email || ""} disabled />
            </div>
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
            <div className="form-group">
              <label>Должность</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                placeholder="Введите должность"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Сохранение..." : "💾 Сохранить"}
            </button>
          </form>
        </div>

        {/* Безопасность */}
        <div className="settings-card">
          <h3>🔒 Безопасность</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Текущий пароль</label>
              <input
                type="password"
                name="oldPassword"
                placeholder="Введите текущий пароль"
                required
              />
            </div>
            <div className="form-group">
              <label>Новый пароль</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Введите новый пароль (мин. 6 символов)"
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Подтверждение пароля</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Подтвердите новый пароль"
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Сохранение..." : "🔑 Сменить пароль"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
