// frontend/src/pages/Admin/sections/DashboardSection.tsx

import React, { useState, useEffect } from "react";
import "./DashboardSection.css";
import adminApi from "../../../../services/adminApi";

interface Stats {
  totalBanks: number;
  totalComplexes: number;
  totalOffers: number;
  totalPrograms: number;
  activeOffers: number;
  totalUsers: number;
  totalCompanies: number;
}

export const DashboardSection: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalBanks: 0,
    totalComplexes: 0,
    totalOffers: 0,
    totalPrograms: 0,
    activeOffers: 0,
    totalUsers: 0,
    totalCompanies: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [banks, complexes, offers, programs, users, companies] =
        await Promise.all([
          adminApi.getBanks().catch(() => []),
          adminApi.getComplexes().catch(() => []),
          adminApi.getOffers().catch(() => []),
          adminApi.getPrograms().catch(() => []),
          adminApi.getUsers().catch(() => []),
          adminApi.getCompanies().catch(() => []),
        ]);

      setStats({
        totalBanks: Array.isArray(banks) ? banks.length : 0,
        totalComplexes: Array.isArray(complexes) ? complexes.length : 0,
        totalOffers: Array.isArray(offers) ? offers.length : 0,
        totalPrograms: Array.isArray(programs) ? programs.length : 0,
        activeOffers: Array.isArray(offers)
          ? offers.filter((o) => o.isActive).length
          : 0,
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalCompanies: Array.isArray(companies) ? companies.length : 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Пользователи",
      value: stats.totalUsers,
      icon: "👥",
      color: "#0ea5e9",
      bgColor: "#e0f2fe",
    },

    {
      label: "Компании",
      value: stats.totalCompanies,
      icon: "🏢",
      color: "#ec4899",
      bgColor: "#fce7f3",
    },
    {
      label: "Жилые комплексы",
      value: stats.totalComplexes,
      icon: "🏗️",
      color: "#10b981",
      bgColor: "#ecfdf5",
    },
    {
      label: "Банки",
      value: stats.totalBanks,
      icon: "🏦",
      color: "#4f46e5",
      bgColor: "#eef2ff",
    },
    {
      label: "Программы",
      value: stats.totalPrograms,
      icon: "📋",
      color: "#8b5cf6",
      bgColor: "#f5f3ff",
    },
    {
      label: "Офферы",
      value: stats.totalOffers,
      icon: "📄",
      color: "#f59e0b",
      bgColor: "#fffbeb",
      sub: `${stats.activeOffers} активных`,
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-section">
        <div className="dashboard-loading">
          <div className="dashboard-loading-spinner"></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-section">
      <div className="dashboard-stats">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="stat-card"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div
              className="stat-card-icon"
              style={{ background: stat.bgColor, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">{stat.value}</span>
              <span className="stat-card-label">{stat.label}</span>
              {stat.sub && <span className="stat-card-sub">{stat.sub}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
