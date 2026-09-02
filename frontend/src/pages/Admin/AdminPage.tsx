// frontend/src/pages/Admin/AdminPage.tsx
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
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
import { useAuth } from "../../hooks/ui/useAuth";

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
  const { user, isAuthenticated, logout } = useAuth();

  // 🔥 Проверяем, что пользователь авторизован и имеет роль admin
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/calculator" replace />;
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
        <div className="admin-body">{renderSection()}</div>
      </div>
    </div>
  );
};
