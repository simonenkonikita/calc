// frontend/src/pages/VerifyEmail/VerifyEmail.tsx

import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";

import "./VerifyEmail.css";
import { authApi } from "../../services/auth";

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Токен не найден. Проверьте ссылку в письме.");
      return;
    }

    authApi
      .verifyEmail(token)
      .then((result) => {
        setStatus("success");
        setMessage(result.message || "Email успешно подтвержден!");
        if (result.data?.email) {
          setEmail(result.data.email);
        }
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error.message || "Ошибка подтверждения email");
      });
  }, [searchParams, navigate]);

  return (
    <div className="verify-email-page">
      <div className="verify-email-container">
        {status === "loading" && (
          <>
            <div className="spinner"></div>
            <h2>Подтверждение email...</h2>
            <p>Пожалуйста, подождите</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="success-icon">✅</div>
            <h2>Email подтвержден!</h2>
            <p className="success-message">{message}</p>
            {email && (
              <p className="email-info">
                Email: <strong>{email}</strong>
              </p>
            )}
            <p className="redirect-text">
              Перенаправление на страницу входа...
            </p>
            <Link to="/login" className="btn-primary">
              Войти в аккаунт
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="error-icon">❌</div>
            <h2>Ошибка подтверждения</h2>
            <p className="error-message">{message}</p>
            <div className="error-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  // Повторная отправка письма
                  authApi
                    .resendVerification()
                    .then(() => alert("✅ Письмо отправлено повторно!"))
                    .catch(() => alert("❌ Ошибка отправки письма"));
                }}
              >
                Отправить письмо повторно
              </button>
              <Link to="/" className="btn-outline">
                На главную
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
