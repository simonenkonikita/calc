// frontend/src/components/Auth/AuthPanel.tsx
import React, { useState, useEffect, useRef } from "react";

import "./AuthPanel.css";
import { useAuth } from "../../hooks/ui/useAuth";

interface AuthPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthPanel: React.FC<AuthPanelProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const panelRef = useRef<HTMLDivElement>(null);

  // Закрытие по клику вне панели
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Закрытие по ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let success;

      if (isLogin) {
        success = await login(email, password);
      } else {
        if (password.length < 6) {
          setError("Пароль должен быть не менее 6 символов");
          setLoading(false);
          return;
        }
        success = await register({ email, password, firstName, lastName });
      }

      if (success) {
        onClose();
        // Очищаем форму
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
        setError("");
      } else {
        setError(isLogin ? "Неверный email или пароль" : "Ошибка регистрации");
      }
    } catch {
      setError("Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
  };

  return (
    <>
      {/* Оверлей */}
      <div
        className={`auth-overlay ${isOpen ? "active" : ""}`}
        onClick={onClose}
      />

      {/* Панель */}
      <div ref={panelRef} className={`auth-panel ${isOpen ? "open" : ""}`}>
        <div className="auth-panel-header">
          <button className="auth-close-btn" onClick={onClose}>
            ✕
          </button>
          <div className="auth-panel-logo">
            <span className="logo-text">
              Ipoteka<span className="logo-highlight">Partner</span>
            </span>
          </div>
        </div>

        <div className="auth-panel-body">
          <div className="auth-panel-title">
            <h2>{isLogin ? "Добро пожаловать!" : "Создайте аккаунт"}</h2>
            <p>
              {isLogin
                ? "Войдите в свой аккаунт"
                : "Зарегистрируйтесь и начните расчёт"}
            </p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="auth-form-row">
                <div className="form-group">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Имя"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Фамилия"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading
                ? "Загрузка..."
                : isLogin
                  ? "Войти"
                  : "Зарегистрироваться"}
            </button>
          </form>

          <div className="auth-switch">
            <p>
              {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}
              <button onClick={switchMode} className="auth-switch-btn">
                {isLogin ? "Зарегистрироваться" : "Войти"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
