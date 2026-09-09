// backend/src/controllers/notification.controller.ts

import { Response } from "express";
import { AuthRequest } from "../types/auth.types";
import { NotificationService } from "../services/NotificationService";
import { BaseController } from "./admin/base.controller";

const notificationService = new NotificationService();

export class NotificationController extends BaseController {
  async getNotifications(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res
          .status(401)
          .json({ success: false, error: "Не авторизован" });
      }

      const { limit = 20, offset = 0, unreadOnly = false } = req.query;
      const result = await notificationService.getUserNotifications(user.id, {
        limit: Number(limit),
        offset: Number(offset),
        unreadOnly: unreadOnly === "true",
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to get notifications");
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res
          .status(401)
          .json({ success: false, error: "Не авторизован" });
      }

      const count = await notificationService.getUnreadCount(user.id);
      res.json({
        success: true,
        data: count,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to get unread count");
    }
  }

  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;
      if (!user) {
        return res
          .status(401)
          .json({ success: false, error: "Не авторизован" });
      }

      await notificationService.markAsRead(id, user.id);
      res.json({
        success: true,
        message: "Notification marked as read",
      });
    } catch (error) {
      this.handleError(res, error, "Failed to mark as read");
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res
          .status(401)
          .json({ success: false, error: "Не авторизован" });
      }

      await notificationService.markAllAsRead(user.id);
      res.json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      this.handleError(res, error, "Failed to mark all as read");
    }
  }

  async deleteNotification(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;
      if (!user) {
        return res
          .status(401)
          .json({ success: false, error: "Не авторизован" });
      }

      await notificationService.deleteNotification(id, user.id);
      res.json({
        success: true,
        message: "Notification deleted",
      });
    } catch (error) {
      this.handleError(res, error, "Failed to delete notification");
    }
  }

  async deleteAllRead(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res
          .status(401)
          .json({ success: false, error: "Не авторизован" });
      }

      await notificationService.deleteAllRead(user.id);
      res.json({
        success: true,
        message: "All read notifications deleted",
      });
    } catch (error) {
      this.handleError(res, error, "Failed to delete read notifications");
    }
  }
}
