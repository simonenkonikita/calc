// frontend/src/components/Navigation/AppNavigation.tsx
import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthPanel } from "../Auth/AuthPanel";

import "./AppNavigation.css";
import { useAuthExtended } from "../../hooks/ui/useAuth";
import ProfileDropdown from "../Auth/ProfileDropdown/ProfileDropdown";
import NotificationBell from "../NotificationBell/NotificationBell";
import { Logo } from "../Logo/Logo";

const AppNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, getRoleLabel, getRoleColor } =
    useAuthExtended();

  const [isAuthPanelOpen, setIsAuthPanelOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setIsDropdownOpen(false);
  };

  const openAuthPanel = () => setIsAuthPanelOpen(true);
  const closeAuthPanel = () => setIsAuthPanelOpen(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // Закрытие dropdown при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Закрытие dropdown по ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // 🔥 Определяем путь и текст для админ-кнопки
  const getAdminLink = () => {
    if (!user) return null;

    const userRole = user.role?.toLowerCase();

    // Администратор системы -> /admin
    if (userRole === "admin") {
      return {
        path: "/admin",
        text: "👑 Панель администратора проекта",
      };
    }

    // Администратор компании (developer_admin) -> /developer
    if (userRole === "developer_admin") {
      return {
        path: "/developer",
        text: "🏢 Панель администратора компании",
      };
    }

    // Менеджер, агент или другие роли - не показываем кнопку
    return null;
  };

  const adminLink = getAdminLink();
  const showAdminLink = adminLink !== null;

  // 🔥 Проверяем активность админ-ссылки
  const isAdminActive =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/developer");

  // 🔥 Получаем цвет роли для аватара
  const userRoleColor = getRoleColor(user?.role);

  return (
    <>
      <nav className="navigation">
        <div className="nav-container">
          <div className="nav-brand">
            <Logo size="large" linkTo="/" variant="dark" />
          </div>

          <ul className="nav-menu">
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
                {showAdminLink && (
                  <li
                    className={`admin-nav-item ${
                      isAdminActive ? "active" : ""
                    }`}
                  >
                    <Link to={adminLink.path}>{adminLink.text}</Link>
                  </li>
                )}
              </>
            )}
          </ul>

          <div className="nav-actions">
            {isAuthenticated ? (
              <div className="nav-user">
                <NotificationBell />
                <button
                  ref={buttonRef}
                  onClick={toggleDropdown}
                  className="avatar-btn"
                  title="Профиль"
                >
                  <span
                    className="avatar-circle"
                    style={{
                      background: `linear-gradient(135deg, ${userRoleColor}, ${userRoleColor}dd)`,
                    }}
                  >
                    {user?.firstName?.[0] || user?.email?.[0] || "👤"}
                  </span>
                </button>

                {/* Dropdown меню */}
                {isDropdownOpen && (
                  <div ref={dropdownRef} className="dropdown-container">
                    <ProfileDropdown
                      user={user}
                      onProfile={() => {
                        navigate("/profile");
                        setIsDropdownOpen(false);
                      }}
                      onLogout={handleLogout}
                    />
                  </div>
                )}
              </div>
            ) : (
              <button onClick={openAuthPanel} className="login-btn-nav">
                Войти
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthPanel isOpen={isAuthPanelOpen} onClose={closeAuthPanel} />
    </>
  );
};

export default AppNavigation;
