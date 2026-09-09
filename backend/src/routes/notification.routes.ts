// backend/src/routes/notification.routes.ts

import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { NotificationController } from "../controllers/notification.controller";

const router = Router();
const notificationController = new NotificationController();

router.use(authMiddleware);

router.get(
  "/",
  notificationController.getNotifications.bind(notificationController),
);
router.get(
  "/unread-count",
  notificationController.getUnreadCount.bind(notificationController),
);
router.put(
  "/:id/read",
  notificationController.markAsRead.bind(notificationController),
);
router.put(
  "/read-all",
  notificationController.markAllAsRead.bind(notificationController),
);
router.delete(
  "/:id",
  notificationController.deleteNotification.bind(notificationController),
);
router.delete(
  "/read-all",
  notificationController.deleteAllRead.bind(notificationController),
);

export default router;
