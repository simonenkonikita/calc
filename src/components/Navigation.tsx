import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        {/*     <div className="nav-brand">
          <Link to="/">Ипотечный калькулятор</Link>
        </div> */}
        <ul className="nav-menu">
          {/*  <li className={location.pathname === "/" ? "active" : ""}>
            <Link to="/">Главная</Link>
          </li> */}
          <li className={location.pathname === "/calculator" ? "active" : ""}>
            <Link to="/calculator">Калькулятор</Link>
          </li>
          {/*   <li className={location.pathname === "/results" ? "active" : ""}>
            <Link to="/results">Результаты</Link>
          </li> */}
          {/*      <li className={location.pathname === "/coefficients" ? "active" : ""}>
            <Link to="/coefficients">Коэффициенты</Link>
          </li> */}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
