// frontend/src/components/Auth/AuthPanel.tsx

import React, { useState, useEffect, useRef } from "react";

import "./AuthPanel.css";
import { useAuth } from "../../hooks/ui/useAuth";
import { authApi } from "../../services/auth";

interface AuthPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "login" | "register" | "forgot";

export const AuthPanel: React.FC<AuthPanelProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [forgotMessage, setForgotMessage] = useState("");

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

  // Сброс состояния при открытии/закрытии
  useEffect(() => {
    if (!isOpen) {
      setMode("login");
      setForgotStatus("idle");
      setForgotMessage("");
      setError("");
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let success;

      if (mode === "login") {
        success = await login(email, password);
      } else if (mode === "register") {
        if (password.length < 6) {
          setError("Пароль должен быть не менее 6 символов");
          setLoading(false);
          return;
        }
        success = await register({ email, password, firstName, lastName });
      }

      if (success) {
        onClose();
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
        setError("");
      } else {
        setError(
          mode === "login" ? "Неверный email или пароль" : "Ошибка регистрации",
        );
      }
    } catch {
      setError("Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Обработчик восстановления пароля
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setForgotStatus("idle");
    setForgotMessage("");

    if (!email) {
      setError("Введите email");
      return;
    }

    try {
      setLoading(true);
      await authApi.forgotPassword(email);
      setForgotStatus("success");
      setForgotMessage("Ссылка для сброса пароля отправлена на вашу почту");
    } catch (error: any) {
      setForgotStatus("error");
      setForgotMessage(error.message || "Ошибка отправки");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setForgotStatus("idle");
    setForgotMessage("");
    setError("");

    if (!email) {
      setError("Введите email");
      return;
    }

    try {
      setLoading(true);
      await authApi.forgotPassword(email);
      setForgotStatus("success");
      setForgotMessage("Ссылка отправлена повторно");
    } catch (error: any) {
      setForgotStatus("error");
      setForgotMessage(error.message || "Ошибка отправки");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError("");
    setForgotStatus("idle");
    setForgotMessage("");
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
  };

  // Рендер заголовка
  const renderHeader = () => {
    if (mode === "login") {
      return { title: "Добро пожаловать!", subtitle: "Войдите в свой аккаунт" };
    }
    if (mode === "register") {
      return {
        title: "Создайте аккаунт",
        subtitle: "Зарегистрируйтесь и начните расчёт",
      };
    }
    return {
      title: "🔑 Восстановление пароля",
      subtitle: "Введите email, указанный при регистрации",
    };
  };

  const header = renderHeader();

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
            <h2>{header.title}</h2>
            <p>{header.subtitle}</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {/* 🔥 ФОРМА ВОССТАНОВЛЕНИЯ ПАРОЛЯ */}
          {mode === "forgot" ? (
            <>
              {forgotStatus === "success" ? (
                <div className="auth-forgot-success">
                  <div className="auth-forgot-icon">📧</div>
                  <p className="auth-forgot-message">{forgotMessage}</p>
                  <p className="auth-forgot-hint">
                    Проверьте почту и перейдите по ссылке для сброса пароля.
                  </p>
                  <button
                    className="auth-forgot-resend-btn"
                    onClick={handleResend}
                    disabled={loading}
                  >
                    {loading ? "Отправка..." : "Отправить повторно"}
                  </button>
                  <button
                    className="auth-back-link"
                    onClick={() => switchMode("login")}
                  >
                    ← Вернуться ко входу
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="auth-form">
                  <div className="form-group">
                    <input
                      type="email"
                      placeholder="Введите ваш email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className={forgotStatus === "error" ? "error" : ""}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={loading}
                  >
                    {loading ? "Отправка..." : "Отправить ссылку"}
                  </button>

                  {forgotStatus === "error" && (
                    <div className="auth-forgot-error">❌ {forgotMessage}</div>
                  )}

                  <button
                    type="button"
                    className="auth-back-link"
                    onClick={() => switchMode("login")}
                  >
                    ← Вернуться ко входу
                  </button>
                </form>
              )}
            </>
          ) : (
            /* 🔥 ФОРМА ВХОДА / РЕГИСТРАЦИИ */
            <form onSubmit={handleSubmit} className="auth-form">
              {mode === "register" && (
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

              {/* 🔥 Ссылка "Забыли пароль?" */}
              {mode === "login" && (
                <div className="auth-forgot-password">
                  <button
                    type="button"
                    className="auth-forgot-link-btn"
                    onClick={() => switchMode("forgot")}
                  >
                    Забыли пароль?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading
                  ? "Загрузка..."
                  : mode === "login"
                    ? "Войти"
                    : "Зарегистрироваться"}
              </button>
            </form>
          )}

          {/* {mode !== "forgot" && (
            <div className="auth-switch">
              <p>
                {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}
                <button
                  onClick={() =>
                    switchMode(mode === "login" ? "register" : "login")
                  }
                  className="auth-switch-btn"
                >
                  {mode === "login" ? "Зарегистрироваться" : "Войти"}
                </button>
              </p>
            </div>
          )} */}
        </div>
      </div>
    </>
  );
};
