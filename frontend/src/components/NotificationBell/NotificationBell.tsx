// frontend/src/components/NotificationBell/NotificationBell.tsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./NotificationBell.css";

interface NotificationMetadata {
  entityId?: string;
  entityName?: string;
  complexId?: string;
  complexName?: string;
  bankId?: string;
  bankName?: string;
  offerId?: string;
  programName?: string;
  changes?: string[];
  added?: string[];
  removed?: string[];
  field?: string;
  oldValue?: any;
  newValue?: any;
  userId?: string;
  userName?: string;
  isAdminNotification?: boolean;
  companyName?: string;
  companyId?: string;
  [key: string]: any;
}

interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: NotificationMetadata;
  isRead: boolean;
  isImportant: boolean;
  createdAt: string;
}

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastUnreadCountRef = useRef(0);

  const API_URL = import.meta.env.VITE_API_URL || "/api";

  // ============================================================
  // ПОЛУЧЕНИЕ УВЕДОМЛЕНИЙ
  // ============================================================

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/notifications?limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data.notifications || []);
        const unread = (data.data.notifications || []).filter(
          (n: AppNotification) => !n.isRead,
        ).length;
        setUnreadCount(unread);
        lastUnreadCountRef.current = unread;
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [API_URL]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        const newCount = data.data;
        const prevCount = lastUnreadCountRef.current;

        // 🔥 Если появились новые — загружаем полный список и показываем браузерное уведомление
        if (newCount > prevCount) {
          console.log(`🔔 Новых уведомлений: ${newCount - prevCount}`);

          // Показываем браузерное уведомление
          if (
            Notification.permission === "granted" &&
            notifications.length > 0
          ) {
            // Загружаем новые, чтобы показать превью
            const freshRes = await fetch(
              `${API_URL}/notifications?limit=${newCount - prevCount}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                credentials: "include",
              },
            );
            const freshData = await freshRes.json();
            if (freshData.success && freshData.data.notifications?.length > 0) {
              const latest = freshData.data.notifications[0];
              new Notification(latest.title, {
                body: latest.message,
                icon: "/logo.svg",
              });
            }
          }

          // Обновляем полный список
          await fetchNotifications();
        }

        setUnreadCount(newCount);
        lastUnreadCountRef.current = newCount;
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [API_URL, fetchNotifications, notifications.length]);

  // ============================================================
  // 🔥 POLLING — обновление каждые 5 секунд
  // ============================================================

  useEffect(() => {
    // Первичная загрузка
    fetchNotifications();

    // Разрешение на браузерные уведомления
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // 🔥 Polling каждые 5 секунд
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 10000);

    // 🔥 Обновление при возврате на вкладку
    const handleFocus = () => {
      console.log("🔔 Focus — refreshing");
      fetchNotifications();
    };
    window.addEventListener("focus", handleFocus);

    // 🔥 Обновление при возврате видимости
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        console.log("🔔 Visible — refreshing");
        fetchNotifications();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchNotifications, fetchUnreadCount]);

  // ============================================================
  // ОСТАЛЬНЫЕ МЕТОДЫ
  // ============================================================

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      lastUnreadCountRef.current = Math.max(0, lastUnreadCountRef.current - 1);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      lastUnreadCountRef.current = 0;
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      const wasUnread = !notifications.find((n) => n.id === id)?.isRead;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
        lastUnreadCountRef.current = Math.max(
          0,
          lastUnreadCountRef.current - 1,
        );
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const deleteAllNotifications = async () => {
    if (!confirm("Удалить все уведомления?")) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/notifications/delete-all`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      setNotifications([]);
      setUnreadCount(0);
      lastUnreadCountRef.current = 0;
      setIsOpen(false);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    const { type, metadata } = notification;

    if (type.includes("complex") && metadata.complexId) {
      navigate(`/projects?complex=${metadata.complexId}`);
    } else if (type.includes("offer") && metadata.offerId) {
      navigate(`/admin/offers?offer=${metadata.offerId}`);
    } else if (type.includes("bank") && metadata.bankId) {
      navigate(`/admin/banks?bank=${metadata.bankId}`);
    }

    setIsOpen(false);
  };

  // ============================================================
  // ЗАКРЫТИЕ ПО КЛИКУ ВНЕ
  // ============================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================================================
  // ЗАКРЫТИЕ ПО ESC
  // ============================================================

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // ============================================================
  // УТИЛИТЫ
  // ============================================================

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Только что";
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} д назад`;
    return new Date(date).toLocaleDateString("ru-RU");
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      complex_created: "🏗️",
      complex_updated: "📝",
      complex_deleted: "🗑️",
      payment_term_added: "💳",
      payment_term_removed: "💳",
      promotion_added: "🔥",
      promotion_removed: "🔥",
      special_offer_added: "⭐",
      special_offer_removed: "⭐",
      bank_added: "🏦",
      bank_updated: "🏦",
      bank_removed: "🏦",
      offer_created: "📋",
      offer_updated: "📝",
      offer_deleted: "🗑️",
      offer_rate_changed: "📊",
      offer_subsidy_changed: "💰",
    };
    return icons[type] || "📢";
  };

  const getNotificationColor = (type: string) => {
    if (type.includes("created") || type.includes("added"))
      return "notification-success";
    if (type.includes("deleted") || type.includes("removed"))
      return "notification-danger";
    if (type.includes("updated") || type.includes("changed"))
      return "notification-info";
    return "";
  };

  // ============================================================
  // РЕНДЕР
  // ============================================================

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        ref={buttonRef}
        className={`bell-button ${unreadCount > 0 ? "has-unread" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Уведомления"
      >
        <svg
          className="bell-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <div className="header-left">
              <h3>Уведомления</h3>
              {unreadCount > 0 && (
                <span className="unread-count">{unreadCount} новых</span>
              )}
            </div>
            <div className="header-actions">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="mark-all-read">
                  Прочитать все
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={deleteAllNotifications} className="delete-all">
                  Очистить все
                </button>
              )}
            </div>
          </div>

          <div className="notifications-list">
            {loading && notifications.length === 0 ? (
              <div className="notifications-loading">
                <div className="loading-spinner"></div>
                <span>Загрузка...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notifications-empty">
                <div className="empty-icon">🔔</div>
                <div className="empty-title">Нет уведомлений</div>
                <div className="empty-hint">
                  Здесь будут появляться уведомления об изменениях
                </div>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.isRead ? "unread" : ""} ${notification.isImportant ? "important" : ""} ${getNotificationColor(notification.type)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-meta">
                      <span className="notification-time">
                        {getTimeAgo(notification.createdAt)}
                      </span>
                      {notification.metadata.userName && (
                        <span className="notification-author">
                          · {notification.metadata.userName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="notification-actions">
                    <button
                      className="delete-btn"
                      onClick={(e) => deleteNotification(notification.id, e)}
                      title="Удалить"
                    >
                      ✕
                    </button>
                  </div>

                  {!notification.isRead && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
