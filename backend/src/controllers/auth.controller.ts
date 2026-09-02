// backend/src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { AuthRequest } from "../types/auth.types";

const authService = new AuthService();

export class AuthController {
  // ============================================================
  // РЕГИСТРАЦИЯ
  // ============================================================
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: "Регистрация успешна",
        data: result.user,
        token: result.token,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Ошибка регистрации",
      });
    }
  }

  // ============================================================
  // ВХОД
  // ============================================================
  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body, res);
      res.json({
        success: true,
        message: "Вход выполнен",
        data: result.user,
        token: result.token,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message || "Ошибка входа",
      });
    }
  }

  // ============================================================
  // ВЫХОД
  // ============================================================
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
  // ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ
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

  // ============================================================
  // ОБНОВЛЕНИЕ ПРОФИЛЯ
  // ============================================================
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

  // ============================================================
  // СМЕНА ПАРОЛЯ
  // ============================================================
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

  // ============================================================
  // ВСЕ ПОЛЬЗОВАТЕЛИ (ТОЛЬКО АДМИН)
  // ============================================================
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

  // ============================================================
  // ОБНОВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ (ТОЛЬКО АДМИН)
  // ============================================================
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

  // ============================================================
  // УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ (ТОЛЬКО АДМИН)
  // ============================================================
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
