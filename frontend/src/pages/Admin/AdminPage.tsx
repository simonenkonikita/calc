// frontend/src/pages/Admin/AdminPage.tsx
import React, { useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { BanksSection } from "./sections/BanksSection";
import { ComplexesSection } from "./sections/ComplexesSection";

import { RatesSection } from "./sections/RatesSection";
import { SubsidiesSection } from "./sections/SubsidiesSection";
import { ConfigSection } from "./sections/ConfigSection";

import "./AdminPage.css";
import { DashboardSection } from "./DashboardSection";
import { ProgramsSection } from "./sections/ProgramsSection";
import { OffersSection } from "./sections/offers";


type AdminSection =
  | "dashboard"
  | "banks"
  | "complexes"
  | "offers"
  | "rates"
  | "subsidies"
  | "programs"
  | "config";

export const AdminPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

  useEffect(() => {
    const saved = localStorage.getItem("admin_auth");
    if (saved === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setError(false);
      setPassword("");
      localStorage.setItem("admin_auth", "true");
    } else {
      setError(true);
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_auth");
  };

  if (isLoading) {
    return (
      <div className="admin-loader">
        <div className="admin-loader-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-bg">
          <div className="admin-login-glow"></div>
        </div>
        <div className="admin-login-card">
          <div className="admin-login-header">
            <span className="admin-login-logo">⚡</span>
            <h1>Admin Panel</h1>
            <p>Войдите для управления данными</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="admin-login-input-group">
              <input
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={error ? "error" : ""}
                autoFocus
              />
              {error && (
                <span className="admin-login-error">
                  <span className="error-icon">✕</span> Неверный пароль
                </span>
              )}
            </div>
            <button type="submit" className="admin-login-btn">
              <span>Войти</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection />;
      case "banks":
        return <BanksSection />;
      case "complexes":
        return <ComplexesSection />;
      case "offers":
        return <OffersSection />;
      case "rates":
        return <RatesSection />;
      case "subsidies":
        return <SubsidiesSection />;
      case "programs": 
        return <ProgramsSection />;
      case "config":
        return <ConfigSection />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="admin-page">
      <AdminSidebar active={activeSection} onSelect={setActiveSection} />
      <div className="admin-content">
        <div className="admin-header">
          <div className="admin-header-left">
            <div className="admin-breadcrumb">
              <span className="breadcrumb-item">Панель управления</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item active">
                {activeSection === "dashboard" && "Обзор"}
                {activeSection === "banks" && "Банки"}
                {activeSection === "complexes" && "Жилые комплексы"}
                {activeSection === "offers" && "Офферы"}
                {activeSection === "rates" && "Ставки"}
                {activeSection === "subsidies" && "Субсидии"}
                {activeSection === "config" && "Конфигурация"}
              </span>
            </div>
          </div>
          <div className="admin-header-right">
            <button className="admin-header-btn" title="Уведомления">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="notification-dot"></span>
            </button>
            <button className="admin-header-btn" title="Обновить">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 4v6h-6" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>
            <div className="admin-user">
              <span className="admin-user-avatar">A</span>
              <span className="admin-user-name">Администратор</span>
            </div>
            <button className="admin-logout-btn" onClick={handleLogout}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Выйти</span>
            </button>
          </div>
        </div>
        <div className="admin-body">{renderSection()}</div>
      </div>
    </div>
  );
};
