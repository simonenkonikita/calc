// frontend/src/pages/LandingPage.tsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

export const LandingPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="landing-page">
      {/* Навигация */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">🏠</span>
            <span className="logo-text">
              Mortgage<span className="logo-highlight">Calc</span>
            </span>
          </div>
          <div className="nav-links">
            <a href="#features">Возможности</a>
            <a href="#benefits">Преимущества</a>
            <Link to="/calculator" className="nav-cta">
              Начать расчёт
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero секция */}
      <section className="hero">
        <div className="hero-container">
          <div className={`hero-content ${isVisible ? "fade-in-up" : ""}`}>
            {/* <div className="hero-badge">
              <span className="badge-dot"></span>
              Интеллектуальный расчёт ипотеки
            </div> */}
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
              {/*  <button className="btn-secondary">📹 Смотреть демо</button> */}
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">9+</span>
                <span className="stat-label">Банков</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">6</span>
                <span className="stat-label">Программ</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">30 сек</span>
                <span className="stat-label">Средний расчёт</span>
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
              Все инструменты что вы могли найти верное решение
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
              Готовы узнать идеальный вариант ипоетки <br />
              для вашего клента?
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

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              {/*    <span className="logo-icon">🏠</span> */}
              <span className="logo-text">
                {/*  Mortgage<span className="logo-highlight">Calc</span> */}
                Ipoteka<span className="logo-highlight">Partner</span>
              </span>
              {/*      <p className="footer-desc">
                Умный ипотечный калькулятор для принятия правильных решений
              </p> */}
            </div>
            {/* <div className="footer-links">
              <div className="footer-column">
                <h4>Продукт</h4>
                <a href="#features">Возможности</a>
                <a href="#">Преимущества</a>
                <a href="#">Цены</a>
              </div>
              <div className="footer-column">
                <h4>Поддержка</h4>
                <a href="#">FAQ</a>
                <a href="#">Контакты</a>
                <a href="#">Блог</a>
              </div>
            </div> */}
          </div>
          {/*      <div className="footer-bottom">
            <span>© 2026 MortgageCalc. Все права защищены.</span>
          </div> */}
        </div>
      </footer>
    </div>
  );
};
