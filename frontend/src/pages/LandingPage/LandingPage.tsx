import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import { Footer } from "../../components/Footer/Footer";
import { api } from "../../services/api";

interface LandingStats {
  banks: number;
  programs: number;
  complexes: number;
  offers: number;
  companies: number;
  loaded: boolean;
}

export const LandingPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<LandingStats>({
    banks: 0,
    programs: 0,
    complexes: 0,
    offers: 0,
    companies: 0,
    loaded: false,
  });

  useEffect(() => {
    setIsVisible(true);
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const result = await api.getLandingStats();

      if (result.success && result.data) {
        setStats({
          banks: result.data.banks,
          programs: result.data.programs,
          complexes: result.data.complexes,
          offers: result.data.offers,
          companies: result.data.companies,
          loaded: true,
        });
        console.log("📊 Landing stats loaded:", result.data);
      } else {
        console.warn("Landing stats not loaded:", result.error);
        setStats((prev) => ({ ...prev, loaded: true }));
      }
    } catch (error) {
      console.error("Error loading landing stats:", error);
      setStats((prev) => ({ ...prev, loaded: true }));
    }
  };

  const formatStat = (
    value: number | undefined | null,
    fallback: string,
  ): string => {
    if (!stats.loaded) return fallback;
    if (value === undefined || value === null || value === 0) return fallback;
    return `${value}`;
  };

  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-container">
          <div className={`hero-content ${isVisible ? "fade-in-up" : ""}`}>
            <h1 className="hero-title">
              Найдите идеальное ипотечное решение
              <br />
              <span className="hero-gradient">для вашего клиента</span>
            </h1>
            <p className="hero-description">
              Сравните предложения банков, узнайте оптимальную ставку и получите
              полный расчёт с учётом всех субсидий и льгот
            </p>
            <div className="hero-actions">
              <Link to="/calculator" className="btn-primary">
                🚀 Начать расчёт
              </Link>
            </div>

            {/* 🔥 Статистика с реальными данными */}
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">
                  {formatStat(stats.banks, "9")}
                </span>
                <span className="stat-label">
                  {stats.banks === 1 ? "Банк" : "Банков"}
                </span>
              </div>

              <div className="stat-divider"></div>

              <div className="stat-item">
                <span className="stat-number">
                  {formatStat(stats.programs, "6")}
                </span>
                <span className="stat-label">
                  {stats.programs === 1 ? "Программа" : "Программ"}
                </span>
              </div>

              <div className="stat-divider"></div>

              <div className="stat-item">
                <span className="stat-number">
                  {formatStat(stats.companies, "20+")}
                </span>
                <span className="stat-label">
                  {stats.companies === 1 ? "Застройщик" : "Застройщиков"}
                </span>
              </div>

              <div className="stat-divider"></div>

              <div className="stat-item">
                <span className="stat-number">
                  {formatStat(stats.complexes, "15")}
                </span>
                <span className="stat-label">ЖК</span>
              </div>

              <div className="stat-divider"></div>

              <div className="stat-item">
                <span className="stat-number">
                  {formatStat(stats.offers, "120+")}
                </span>
                <span className="stat-label">
                  {stats.offers === 1 ? "Предложение" : "Предложений"}
                </span>
              </div>
            </div>
          </div>
          <div className={`hero-visual ${isVisible ? "fade-in-up-delay" : ""}`}>
            <div className="calculator-preview">
              <div className="preview-header">
                <div className="preview-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="preview-title">Калькулятор</span>
              </div>
              <div className="preview-body">
                <div className="preview-row">
                  <span className="preview-label">Стоимость объекта</span>
                  <span className="preview-value">5 000 000 ₽</span>
                </div>
                <div className="preview-row">
                  <span className="preview-label">Первоначальный взнос</span>
                  <span className="preview-value">1 000 000 ₽</span>
                </div>
                <div className="preview-row">
                  <span className="preview-label">Срок</span>
                  <span className="preview-value">30 лет</span>
                </div>
                <div className="preview-divider"></div>
                <div className="preview-result">
                  <span className="preview-label">Ежемесячный платёж</span>
                  <span className="preview-result-value">24 500 ₽</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features секция */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Что вы можете</h2>
            <p className="section-subtitle">
              Все инструменты, чтобы найти верное решение
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏦</div>
              <h3>Сравнение банков</h3>
              <p>
                Сбербанк, ВТБ, Альфа-Банк, Совкомбанк и другие — все предложения
                в одном месте
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍👩‍👧‍👦</div>
              <h3>Семейная ипотека</h3>
              <p>
                Полный расчёт с учётом государственных субсидий и льготных
                программ
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💻</div>
              <h3>ИТ ипотека</h3>
              <p>
                Специальные условия для IT-специалистов с пониженной ставкой
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Динамические ставки</h3>
              <p>
                Умная система подбирает оптимальную ставку в зависимости от
                параметров
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Два договора</h3>
              <p>
                Расчёт для сложных схем с разделением на льготную и рыночную
                часть
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Быстрый расчёт</h3>
              <p>Мгновенные результаты с детальной разбивкой всех параметров</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA секция */}
      <section id="cta" className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">
              Готовы узнать идеальный вариант ипотеки <br />
              для вашего клиента?
            </h2>
            <p className="cta-description">
              Введите параметры и получите полный расчёт за 30 секунд
            </p>
            <Link to="/calculator" className="btn-primary btn-large">
              🔥 Начать расчёт
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
