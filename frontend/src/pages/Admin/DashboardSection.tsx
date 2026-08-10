// frontend/src/pages/Admin/sections/DashboardSection.tsx
import React, { useState, useEffect } from "react";
import { adminApi } from "../../services/adminApi";
import "./DashboardSection.css";

interface Stats {
  totalBanks: number;
  totalComplexes: number;
  totalOffers: number;
  totalPrograms: number;
  activeOffers: number;
}

export const DashboardSection: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalBanks: 0,
    totalComplexes: 0,
    totalOffers: 0,
    totalPrograms: 0,
    activeOffers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [banks, complexes, offers, programs] = await Promise.all([
        adminApi.getBanks(),
        adminApi.getComplexes(),
        adminApi.getOffers(),
        adminApi.getPrograms(),
      ]);

      setStats({
        totalBanks: Array.isArray(banks) ? banks.length : 0,
        totalComplexes: Array.isArray(complexes) ? complexes.length : 0,
        totalOffers: Array.isArray(offers) ? offers.length : 0,
        totalPrograms: Array.isArray(programs) ? programs.length : 0,
        activeOffers: Array.isArray(offers)
          ? offers.filter((o) => o.isActive).length
          : 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Банки",
      value: stats.totalBanks,
      icon: "🏦",
      color: "#4f46e5",
      bgColor: "#eef2ff",
    },
    {
      label: "Жилые комплексы",
      value: stats.totalComplexes,
      icon: "🏗️",
      color: "#10b981",
      bgColor: "#ecfdf5",
    },
    {
      label: "Офферы",
      value: stats.totalOffers,
      icon: "📄",
      color: "#f59e0b",
      bgColor: "#fffbeb",
      sub: `${stats.activeOffers} активных`,
    },
    {
      label: "Программы",
      value: stats.totalPrograms,
      icon: "📋",
      color: "#8b5cf6",
      bgColor: "#f5f3ff",
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
      {" "}
      {/* ✅ класс-обёртка */}
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
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>📊 Быстрый доступ</h3>
          </div>
          <div className="dashboard-quick-actions">
            <button
              className="quick-action"
              onClick={() => (window.location.hash = "banks")}
            >
              <span className="quick-action-icon">🏦</span>
              <span>Управление банками</span>
            </button>
            <button
              className="quick-action"
              onClick={() => (window.location.hash = "offers")}
            >
              <span className="quick-action-icon">📄</span>
              <span>Управление офферами</span>
            </button>
            <button
              className="quick-action"
              onClick={() => (window.location.hash = "complexes")}
            >
              <span className="quick-action-icon">🏗️</span>
              <span>Управление ЖК</span>
            </button>
            <button
              className="quick-action"
              onClick={() => (window.location.hash = "config")}
            >
              <span className="quick-action-icon">⚙️</span>
              <span>Конфигурация</span>
            </button>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>💡 Советы</h3>
          </div>
          <div className="dashboard-tips">
            <div className="tip-item">
              <span className="tip-icon">💡</span>
              <p>
                Регулярно обновляйте ставки банков для актуальности расчетов
              </p>
            </div>
            <div className="tip-item">
              <span className="tip-icon">📌</span>
              <p>
                Проверяйте активные офферы — неактивные не отображаются на сайте
              </p>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🔗</span>
              <p>Связывайте офферы с конкретными ЖК для точных расчетов</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
