// frontend/src/components/Navigation/Navigation.tsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthPanel } from "../Auth/AuthPanel";
import "./AppNavigation.css";
import { useAuth } from "../../hooks/ui/useAuth";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isAuthPanelOpen, setIsAuthPanelOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const openAuthPanel = () => setIsAuthPanelOpen(true);
  const closeAuthPanel = () => setIsAuthPanelOpen(false);

  return (
    <>
      <nav className="navigation">
        <div className="nav-container">
          <div className="nav-brand">
            <Link to="/" className="brand-link">
              <img src="/logo.svg" alt="Логотип" className="brand-logo" />
            </Link>
          </div>

          <ul className="nav-menu">
            {/* Защищенные ссылки (только для авторизованных) */}
            {isAuthenticated && (
              <>
                <li
                  className={
                    location.pathname === "/calculator" ? "active" : ""
                  }
                >
                  <Link to="/calculator">Калькулятор</Link>
                </li>
                <li
                  className={location.pathname === "/projects" ? "active" : ""}
                >
                  <Link to="/projects">Проекты</Link>
                </li>

                {/* Админка (только для админов) */}
                {isAdmin && (
                  <li
                    className={location.pathname === "/admin" ? "active" : ""}
                  >
                    <Link to="/admin">
                      <span className="admin-icon">⚙️</span> Админка
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>

          {/* Правая часть навигации */}
          <div className="nav-actions">
            {isAuthenticated ? (
              <div className="nav-user">
                <Link to="/profile" className="profile-link">
                  <span className="user-avatar">👤</span>
                  <span className="user-name">
                    {user?.firstName ||
                      user?.email?.split("@")[0] ||
                      "Пользователь"}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="logout-btn"
                  title="Выйти"
                >
                  <span className="logout-icon">🚪</span>
                </button>
              </div>
            ) : (
              <button onClick={openAuthPanel} className="login-btn-nav">
                Войти
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Панель авторизации */}
      <AuthPanel isOpen={isAuthPanelOpen} onClose={closeAuthPanel} />
    </>
  );
};

export default Navigation;
