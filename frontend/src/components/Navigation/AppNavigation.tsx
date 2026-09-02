// frontend/src/components/Navigation/AppNavigation.tsx
import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthPanel } from "../Auth/AuthPanel";

import "./AppNavigation.css";
import { useAuth } from "../../hooks/ui/useAuth";
import { ProfileDropdown } from "../Auth/ProfileDropdown/ProfileDropdown";

const AppNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
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
  const closeDropdown = () => setIsDropdownOpen(false);

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
                {isAdmin && (
                  <li
                    className={location.pathname === "/admin" ? "active" : ""}
                  >
                    <Link to="/admin">Админка</Link>
                  </li>
                )}
              </>
            )}
          </ul>

          <div className="nav-actions">
            {isAuthenticated ? (
              <div className="nav-user">
                <button
                  ref={buttonRef}
                  onClick={toggleDropdown}
                  className="avatar-btn"
                  title="Профиль"
                >
                  <span className="avatar-circle">
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
