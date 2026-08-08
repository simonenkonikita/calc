// frontend/src/pages/Admin/AdminPage.tsx

import React, { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { BanksSection } from "./sections/BanksSection";
import { ComplexesSection } from "./sections/ComplexesSection";
import { ProgramsSection } from "./sections/ProgramsSection";
import { RatesSection } from "./sections/RatesSection";
import { SubsidiesSection } from "./sections/SubsidiesSection";
import { ConfigSection } from "./sections/ConfigSection";
import "./AdminPage.css";

type AdminSection =
  | "banks"
  | "complexes"
  | "programs"
  | "rates"
  | "subsidies"
  | "config";

export const AdminPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>("banks");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  // 🔥 Получаем пароль из переменных окружения
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setError(false);
      setPassword("");
      localStorage.setItem("admin_auth", "true");
    } else {
      setError(true);
      // 🔥 Очищаем поле пароля при ошибке
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_auth");
  };

  React.useEffect(() => {
    const saved = localStorage.getItem("admin_auth");
    if (saved === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <h1>🔐 Вход в админ-панель</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={error ? "error" : ""}
              autoFocus
            />
            {error && <p className="error-text">❌ Неверный пароль</p>}
            <button type="submit">Войти</button>
          </form>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case "banks":
        return <BanksSection />;
      case "complexes":
        return <ComplexesSection />;
      case "programs":
        return <ProgramsSection />;
      case "rates":
        return <RatesSection />;
      case "subsidies":
        return <SubsidiesSection />;
      case "config":
        return <ConfigSection />;
      default:
        return <BanksSection />;
    }
  };

  return (
    <div className="admin-page">
      <AdminSidebar active={activeSection} onSelect={setActiveSection} />
      <div className="admin-content">
        <div className="admin-header">
          <h1>Управление данными</h1>
          <button className="admin-logout" onClick={handleLogout}>
            Выйти
          </button>
        </div>
        <div className="admin-body">{renderSection()}</div>
      </div>
    </div>
  );
};
