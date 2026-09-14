// frontend/src/components/Footer/Footer.tsx

import React from "react";
import { Logo } from "../Logo/Logo";
import "./Footer.css";

export const Footer: React.FC = () => {
  return (
    <footer className="landing-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <Logo size="large" linkTo="/" variant="dark" />
            {/*   <p className="footer-desc">
              Сервис подбора ипотечных программ для профессионалов рынка
              недвижимости
            </p> */}
          </div>

          {/*   <div className="footer-links">
            <div className="footer-column">
              <h4>Продукт</h4>
              <Link to="/calculator">Калькулятор</Link>
              <Link to="/#features">Возможности</Link>
              <Link to="/#cta">Начать расчёт</Link>
            </div>
            <div className="footer-column">
              <h4>Компания</h4>
              <a href="mailto:info@ipotekapartner.ru">Связаться</a>
              <a href="/privacy">Конфиденциальность</a>
              <a href="/terms">Условия</a>
            </div>
          </div> */}
        </div>

        {/* <div className="footer-bottom">
          © {new Date().getFullYear()} IpotekaPartner. Все права защищены.
        </div> */}
      </div>
    </footer>
  );
};
