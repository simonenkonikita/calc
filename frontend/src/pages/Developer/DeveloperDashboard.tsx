// frontend/src/pages/Developer/DeveloperDashboard.tsx

import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthExtended } from "../../hooks/ui/useAuth";

// 🔥 ИМПОРТИРУЕМ СУЩЕСТВУЮЩИЕ КОМПОНЕНТЫ ИЗ АДМИНКИ

import "./DeveloperDashboard.css";
import { AdminSidebar } from "../Admin/components/AdminSidebar/AdminSidebar";
import { DashboardSection } from "../Admin/components/DashboardSection/DashboardSection";
import { UsersSection } from "../Admin/sections/UsersSection/UsersSection";
import { OffersSection } from "../Admin/sections/OffersSection/OffersSection";
import { ComplexesSection } from "../Admin/sections/ComplexesSection/ComplexesSection";
import { SettingsSection } from "./SettingsSection";

type DeveloperSection =
  | "dashboard"
  | "complexes"
  | "offers"
  | "users"
  | "settings";

export const DeveloperDashboard: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isDeveloperAdmin } =
    useAuthExtended();
  const [activeSection, setActiveSection] =
    useState<DeveloperSection>("dashboard");

  // Проверка авторизации
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Проверка роли - только admin и developer_admin имеют доступ
  if (!isAdmin && !isDeveloperAdmin) {
    return <Navigate to="/calculator" replace />;
  }

  // 🔥 Видимые секции для застройщика (без Companies и Config)
  const visibleSections = [
    "dashboard",
    "complexes",
    "offers",
    "users",
    "settings",
  ];

  // Если текущая секция недоступна, переключаем на dashboard
  if (!visibleSections.includes(activeSection)) {
    setActiveSection("dashboard");
  }

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection />;
      case "complexes":
        return <ComplexesSection />;
      case "offers":
        return <OffersSection />;
      case "users":
        return <UsersSection />;
      case "settings":
        return <SettingsSection />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="developer-dashboard">
      <AdminSidebar
        active={activeSection}
        onSelect={setActiveSection}
        visibleSections={visibleSections}
        userRole={user?.role}
      />
      <div className="developer-content">
        <div className="developer-body">{renderSection()}</div>
      </div>
    </div>
  );
};
