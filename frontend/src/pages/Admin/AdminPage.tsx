// frontend/src/pages/Admin/AdminPage.tsx

import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { BanksSection } from "./sections/BanksSection";
import { ComplexesSection } from "./sections/ComplexesSection";
import { RatesSection } from "./sections/RatesSection";
import { SubsidiesSection } from "./sections/SubsidiesSection";
import { ConfigSection } from "./sections/ConfigSection";
import { DashboardSection } from "./DashboardSection";
import { ProgramsSection } from "./sections/ProgramsSection";
import { OffersSection } from "./sections/OffersSection";
import { UsersSection } from "./sections/UsersSection";
import "./AdminPage.css";
import { useAuthExtended } from "../../hooks/ui/useAuth";
import { CompaniesSection } from "./sections/CompaniesSection";

type AdminSection =
  | "dashboard"
  | "companies" // 🔥 НОВАЯ
  | "users" // 🔥 ОБНОВЛЕНА
  | "banks"
  | "complexes"
  | "offers"
  | "rates"
  | "subsidies"
  | "programs"
  | "config";

export const AdminPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const { user, isAuthenticated, isAdmin, isDeveloperAdmin } =
    useAuthExtended();

  // Проверка авторизации
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Проверка роли - только admin и developer_admin имеют доступ к админке
  if (!isAdmin && !isDeveloperAdmin) {
    return <Navigate to="/calculator" replace />;
  }

  // 🔥 Получаем видимые секции в зависимости от роли
  const getVisibleSections = (): AdminSection[] => {
    const sections: AdminSection[] = ["dashboard"];

    // Только admin видит разделы компаний и пользователей
    if (isAdmin) {
      sections.push("companies");
      sections.push("users");
    }

    // Все разработчики видят остальные разделы
    sections.push(
      "complexes",
      "banks",
      "programs",
      "offers",
      "rates",
      "subsidies",
    );

    // Только admin видит конфигурацию
    if (isAdmin) {
      sections.push("config");
    }

    return sections;
  };

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection />;
      case "companies":
        if (!isAdmin) return <div>Доступ запрещен</div>;
        return <CompaniesSection />;
      case "users":
        if (!isAdmin) return <div>Доступ запрещен</div>;
        return <UsersSection />;
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
        if (!isAdmin) return <div>Доступ запрещен</div>;
        return <ConfigSection />;
      default:
        return <DashboardSection />;
    }
  };

  const visibleSections = getVisibleSections();

  // Если текущая секция недоступна для пользователя, переключаем на dashboard
  if (!visibleSections.includes(activeSection)) {
    setActiveSection("dashboard");
  }

  return (
    <div className="admin-page">
      <AdminSidebar
        active={activeSection}
        onSelect={setActiveSection}
        visibleSections={visibleSections}
        userRole={user?.role}
      />
      <div className="admin-content">
        <div className="admin-body">{renderSection()}</div>
      </div>
    </div>
  );
};
