// backend/src/routes/notification.routes.ts

import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { NotificationController } from "../controllers/notification.controller";

const router = Router();
const notificationController = new NotificationController();

// Применяем authMiddleware ко всем маршрутам роутера
router.use(authMiddleware);

// ============================================================
// СТАТИЧЕСКИЕ МАРШРУТЫ (до /:id)
// ============================================================
router.get(
  "/unread-count",
  notificationController.getUnreadCount.bind(notificationController),
);

router.put(
  "/read-all",
  notificationController.markAllAsRead.bind(notificationController),
);

router.delete(
  "/read-all",
  notificationController.deleteAllRead.bind(notificationController),
);

router.delete(
  "/delete-all",
  notificationController.deleteAll.bind(notificationController),
);

// ============================================================
// КОРНЕВОЙ МАРШРУТ
// ============================================================
router.get(
  "/",
  notificationController.getNotifications.bind(notificationController),
);

// ============================================================
// МАРШРУТЫ С :id (в самом конце!)
// ============================================================
router.put(
  "/:id/read",
  notificationController.markAsRead.bind(notificationController),
);

router.delete(
  "/:id",
  notificationController.deleteNotification.bind(notificationController),
);

export default router;
