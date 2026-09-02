// backend/src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { AuthRequest } from "../types/auth.types";

const authService = new AuthService();

export class AuthController {
  // ============================================================
  // ПУБЛИЧНЫЕ МЕТОДЫ
  // ============================================================

  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: "Регистрация успешна",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Ошибка регистрации",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body, res);
      res.json({
        success: true,
        message: "Вход выполнен",
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message || "Ошибка входа",
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      authService.logout(res);
      res.json({
        success: true,
        message: "Выход выполнен",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Ошибка выхода",
      });
    }
  }

  // ============================================================
  // ЗАЩИЩЕННЫЕ МЕТОДЫ
  // ============================================================

  async me(req: AuthRequest, res: Response) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Не авторизован",
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Не авторизован",
        });
      }

      const user = await authService.updateProfile(userId, req.body);

      res.json({
        success: true,
        message: "Профиль обновлен",
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          company: user.company,
          position: user.position,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Ошибка обновления профиля",
      });
    }
  }

  async changePassword(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Не авторизован",
        });
      }

      await authService.changePassword(userId, req.body);

      res.json({
        success: true,
        message: "Пароль изменен",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Ошибка смены пароля",
      });
    }
  }

  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user || user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Доступ запрещен. Требуются права администратора",
        });
      }

      const users = await authService.getAllUsers();
      res.json({
        success: true,
        data: users,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateUser(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user || user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Доступ запрещен. Требуются права администратора",
        });
      }

      const { id } = req.params;
      const updatedUser = await authService.updateUser(id, req.body);

      res.json({
        success: true,
        message: "Пользователь обновлен",
        data: updatedUser,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Ошибка обновления пользователя",
      });
    }
  }

  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user || user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Доступ запрещен. Требуются права администратора",
        });
      }

      const { id } = req.params;
      await authService.deleteUser(id);

      res.json({
        success: true,
        message: "Пользователь удален",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Ошибка удаления пользователя",
      });
    }
  }
}
