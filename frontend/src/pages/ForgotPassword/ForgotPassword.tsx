/* // frontend/src/pages/ForgotPassword/ForgotPassword.tsx

import React, { useState } from "react";
import { Link } from "react-router-dom";

import "./ForgotPassword.css";
import { authApi } from "../../services/auth";

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setStatus("error");
      setMessage("Введите email");
      return;
    }

    try {
      setStatus("loading");
      await authApi.forgotPassword(email);
      setStatus("success");
      setMessage("Ссылка для сброса пароля отправлена на вашу почту");
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Ошибка отправки");
    }
  };

  const handleResend = async () => {
    if (!email) {
      setStatus("error");
      setMessage("Введите email");
      return;
    }

    try {
      setStatus("loading");
      await authApi.forgotPassword(email);
      setStatus("success");
      setMessage("Ссылка отправлена повторно");
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Ошибка отправки");
    }
  };

  const isSubmitting = status === "loading";

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <h2>🔑 Восстановление пароля</h2>
          <p>Введите email, указанный при регистрации</p>
        </div>

        {status === "success" ? (
          <div className="success-content">
            <div className="success-icon">📧</div>
            <p className="success-message">{message}</p>
            <p className="success-hint">
              Проверьте почту и перейдите по ссылке для сброса пароля.
            </p>
            <button
              className="btn-secondary"
              onClick={handleResend}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Отправка..." : "Отправить повторно"}
            </button>
            <Link to="/login" className="back-link">
              ← Вернуться ко входу
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className={status === "error" ? "error" : ""}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Отправка..." : "Отправить ссылку"}
            </button>

            {message && (
              <div className={`message ${status}`}>
                {status === "error" && "❌"} {message}
              </div>
            )}

            <Link to="/login" className="back-link">
              ← Вернуться ко входу
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};
 */
