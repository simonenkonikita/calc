// backend/src/controllers/auth.controller.ts

import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { AuthRequest } from "../types/auth.types";

const authService = new AuthService();

export class AuthController {
  // ============================================================
  // РЕГИСТРАЦИЯ (ТОЛЬКО ДЛЯ АГЕНТОВ)
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
          companyId: user.companyId,
          companyName: user.company?.name,
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
  // 🔥 СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ АДМИНИСТРАТОРОМ (ТОЛЬКО АДМИН)
  // ============================================================
  async createUserByAdmin(req: AuthRequest, res: Response) {
    try {
      const currentUser = req.user;

      // Проверяем права - только admin
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({
          success: false,
          error:
            "Доступ запрещен. Только администратор проекта может создавать пользователей",
        });
      }

      const user = await authService.createUserByAdmin(req.body);

      res.status(201).json({
        success: true,
        message: "Пользователь создан",
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Ошибка создания пользователя",
      });
    }
  }

  // ============================================================
  // 🔥 СОЗДАНИЕ КОМПАНИИ БЕЗ АДМИНИСТРАТОРА (ТОЛЬКО АДМИН)
  // ============================================================
  async createCompany(req: AuthRequest, res: Response) {
    try {
      const currentUser = req.user;

      // Проверяем права - только admin
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({
          success: false,
          error:
            "Доступ запрещен. Только администратор проекта может создавать компании",
        });
      }

      const { name, phone, address, website, description } = req.body;

      // Валидация
      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "Название компании обязательно",
        });
      }

      // Проверяем, что компания не существует
      const existing = await authService.getCompanyByName(name);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: `Компания с названием "${name}" уже существует`,
        });
      }

      // Создаем компанию
      const company = await authService.createCompany({
        name: name.trim(),
        phone: phone || "",
        address: address || "",
        website: website || "",
        isActive: true,
        createdById: currentUser.id,
      });

      res.status(201).json({
        success: true,
        message: "Компания создана",
        data: company,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Ошибка создания компании",
      });
    }
  }
  // ============================================================
  // СОЗДАНИЕ МЕНЕДЖЕРА КОМПАНИИ
  // ============================================================
  async createCompanyManager(req: AuthRequest, res: Response) {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return res.status(401).json({
          success: false,
          error: "Не авторизован",
        });
      }

      const fullUser = await authService.getUserById(currentUser.id);
      if (!fullUser) {
        return res.status(404).json({
          success: false,
          error: "Пользователь не найден",
        });
      }

      // 🔥 ДЛЯ developer_admin - ПРОВЕРЯЕМ, ЧТО У НЕГО ЕСТЬ КОМПАНИЯ
      if (currentUser.role === "developer_admin" && !currentUser.companyId) {
        return res.status(403).json({
          success: false,
          error: "У вас нет компании. Вы не можете создавать менеджеров",
        });
      }

      const user = await authService.createCompanyManager(req.body, fullUser);

      res.status(201).json({
        success: true,
        message: "Менеджер компании создан",
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          companyId: user.companyId,
          companyName: user.company?.name,
          position: user.position,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Ошибка создания менеджера",
      });
    }
  }

  // ============================================================
  // ПОЛУЧЕНИЕ ПОЛЬЗОВАТЕЛЕЙ
  // ============================================================
  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Не авторизован",
        });
      }

      const fullUser = await authService.getUserById(user.id);
      if (!fullUser) {
        return res.status(404).json({
          success: false,
          error: "Пользователь не найден",
        });
      }

      const users = await authService.getAllUsers(fullUser);

      res.json({
        success: true,
        data: users.map((u) => ({
          id: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
          companyId: u.companyId,
          companyName: u.company?.name,
          position: u.position,
          isActive: u.isActive,
          createdAt: u.createdAt,
        })),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // ============================================================
  // ПОЛУЧЕНИЕ ПОЛЬЗОВАТЕЛЕЙ КОМПАНИИ
  // ============================================================
  async getUsersByCompany(req: AuthRequest, res: Response) {
    try {
      const { companyId } = req.params;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Не авторизован",
        });
      }

      const fullUser = await authService.getUserById(user.id);
      if (!fullUser) {
        return res.status(404).json({
          success: false,
          error: "Пользователь не найден",
        });
      }

      const users = await authService.getUsersByCompany(companyId, fullUser);

      res.json({
        success: true,
        data: users,
      });
    } catch (error: any) {
      res.status(403).json({
        success: false,
        error: error.message,
      });
    }
  }

  // ============================================================
  // ОБНОВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ
  // ============================================================
  async updateUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Не авторизован",
        });
      }

      const fullUser = await authService.getUserById(user.id);
      if (!fullUser) {
        return res.status(404).json({
          success: false,
          error: "Пользователь не найден",
        });
      }

      const updatedUser = await authService.updateUser(id, req.body, fullUser);

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
  // УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ
  // ============================================================
  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Не авторизован",
        });
      }

      const fullUser = await authService.getUserById(user.id);
      if (!fullUser) {
        return res.status(404).json({
          success: false,
          error: "Пользователь не найден",
        });
      }

      await authService.deleteUser(id, fullUser);

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
