// frontend/src/pages/ResetPassword/ResetPassword.tsx

import React, { useState, useEffect } from "react";
import { useSearchParams, Link, Navigate, useNavigate } from "react-router-dom";

import "./ResetPassword.css";

import { useAuth } from "../../hooks/ui/useAuth";
import { authApi } from "../../services/auth";

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const token = searchParams.get("token");

  // Если нет токена - редирект на главную
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Если пользователь уже авторизован - редирект на главную
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setStatus("error");
      setMessage("Пароль должен быть не менее 6 символов");
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("Пароли не совпадают");
      return;
    }

    try {
      setStatus("loading");
      await authApi.resetPassword(token, newPassword);
      setStatus("success");
      setMessage("Пароль успешно изменен!");
      // Запускаем таймер для редиректа
      setCountdown(5);
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Ошибка сброса пароля");
    }
  };

  // 🔥 Автоматический редирект через 5 секунд после успешной смены пароля
  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    if (status === "success" && countdown === 0) {
      navigate("/login");
    }
  }, [status, countdown, navigate]);

  if (status === "success") {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <h2>Пароль изменен!</h2>
            <p className="success-message">{message}</p>
            <p className="success-hint">
              Теперь вы можете войти с новым паролем.
            </p>
            <p className="redirect-text">
              Перенаправление на страницу входа через {countdown} секунд...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-header">
          <h2>🔑 Сброс пароля</h2>
          <p>Введите новый пароль</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Новый пароль</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder=""
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={status === "loading"}
                className={status === "error" ? "error" : ""}
                autoFocus
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? "скрыть" : "показать"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Подтвердите пароль</label>
            <input
              type="password"
              placeholder=""
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={status === "loading"}
              className={status === "error" ? "error" : ""}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Сохранение..." : "Сохранить пароль"}
          </button>

          {message && (
            <div className={`message ${status}`}>
              {status === "error" && "❌"} {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
