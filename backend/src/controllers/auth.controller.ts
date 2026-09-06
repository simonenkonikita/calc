// backend/src/controllers/auth.controller.ts

import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { AuthRequest } from "../types/auth.types";
import { LoginDto } from "../dtos/AuthDto";

const authService = new AuthService();

// 🔥 Вспомогательная функция для получения baseUrl
const getBaseUrl = (req: Request): string => {
  return process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
};

export class AuthController {
  // ============================================================
  // РЕГИСТРАЦИЯ
  // ============================================================
  async register(req: Request, res: Response) {
    try {
      const baseUrl = getBaseUrl(req); // ✅ используем функцию
      const result = await authService.register(req.body, baseUrl);

      res.status(201).json({
        success: true,
        message:
          "Регистрация успешна. На вашу почту отправлено письмо с подтверждением.",
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
  // ПОДТВЕРЖДЕНИЕ EMAIL
  // ============================================================
  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: "Токен не предоставлен",
        });
      }

      const user = await authService.verifyEmail(token);

      if (!user) {
        return res.status(400).json({
          success: false,
          error: "Неверный или истекший токен",
        });
      }

      res.json({
        success: true,
        message: "Email успешно подтвержден",
        data: { email: user.email },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Ошибка подтверждения email",
      });
    }
  }

  // ============================================================
  // ПОВТОРНАЯ ОТПРАВКА ПИСЬМА ПОДТВЕРЖДЕНИЯ (саю юзер)
  // ============================================================
  async resendVerification(req: AuthRequest, res: Response) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Не авторизован",
        });
      }

      const baseUrl = getBaseUrl(req); // ✅ исправлено
      await authService.resendVerification(user.id, baseUrl);

      res.json({
        success: true,
        message: "Письмо с подтверждением отправлено повторно",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Ошибка отправки письма",
      });
    }
  }

  // ============================================================
  // ПОВТОРНАЯ ОТПРАВКА ПИСЬМА ПОДТВЕРЖДЕНИЯ (ДЛЯ АДМИНА)
  // ============================================================
  async resendVerificationByAdmin(req: AuthRequest, res: Response) {
    try {
      const currentUser = req.user;
      const { id } = req.params;

      // Проверка прав
      if (!currentUser) {
        return res.status(401).json({
          success: false,
          error: "Не авторизован",
        });
      }

      if (
        currentUser.role !== "admin" &&
        currentUser.role !== "developer_admin"
      ) {
        return res.status(403).json({
          success: false,
          error:
            "Доступ запрещен. Только администратор может отправлять письма подтверждения другим пользователям",
        });
      }

      // Для developer_admin проверяем, что пользователь из его компании
      if (currentUser.role === "developer_admin") {
        const targetUser = await authService.getUserById(id);
        if (!targetUser) {
          return res.status(404).json({
            success: false,
            error: "Пользователь не найден",
          });
        }
        if (targetUser.companyId !== currentUser.companyId) {
          return res.status(403).json({
            success: false,
            error:
              "Вы можете отправлять письма только пользователям вашей компании",
          });
        }
      }

      const baseUrl = getBaseUrl(req);
      await authService.resendVerification(id, baseUrl);

      res.json({
        success: true,
        message: "Письмо с подтверждением отправлено повторно",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Ошибка отправки письма",
      });
    }
  }

  // ============================================================
  // ЗАБЫЛИ ПАРОЛЬ - ОТПРАВКА ССЫЛКИ
  // ============================================================
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: "Email обязателен",
        });
      }

      const baseUrl = getBaseUrl(req); // ✅ исправлено
      await authService.sendPasswordReset(email, baseUrl);

      res.json({
        success: true,
        message:
          "Если пользователь с таким email существует, на него отправлена ссылка для сброса пароля",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Ошибка отправки письма",
      });
    }
  }

  // ============================================================
  // СБРОС ПАРОЛЯ
  // ============================================================
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          error: "Токен и новый пароль обязательны",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: "Пароль должен быть не менее 6 символов",
        });
      }

      const user = await authService.resetPassword(token, newPassword);

      if (!user) {
        return res.status(400).json({
          success: false,
          error: "Неверный или истекший токен",
        });
      }

      res.json({
        success: true,
        message: "Пароль успешно изменен",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Ошибка сброса пароля",
      });
    }
  }

  // ============================================================
  // СБРОС ПАРОЛЯ ПОЛЬЗОВАТЕЛЯ (из админки)
  // ============================================================
  async resetUserPassword(req: AuthRequest, res: Response) {
    try {
      const currentUser = req.user;
      const { id } = req.params;
      const { newPassword } = req.body;

      if (
        !currentUser ||
        (currentUser.role !== "admin" && currentUser.role !== "developer_admin")
      ) {
        return res.status(403).json({
          success: false,
          error:
            "Доступ запрещен. Только администратор может сбрасывать пароли",
        });
      }

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: "Пароль должен быть не менее 6 символов",
        });
      }

      const baseUrl = getBaseUrl(req); // ✅ исправлено
      const user = await authService.resetPasswordByAdmin(
        id,
        newPassword,
        baseUrl,
      );

      res.json({
        success: true,
        message: "Пароль успешно сброшен. Пользователь уведомлен по email.",
        data: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Ошибка сброса пароля",
      });
    }
  }

  // ============================================================
  // ОТПРАВКА ССЫЛКИ ДЛЯ СБРОСА ПАРОЛЯ (из админки)
  // ============================================================
  async sendPasswordResetLink(req: AuthRequest, res: Response) {
    try {
      const currentUser = req.user;
      const { id } = req.params;

      if (
        !currentUser ||
        (currentUser.role !== "admin" && currentUser.role !== "developer_admin")
      ) {
        return res.status(403).json({
          success: false,
          error:
            "Доступ запрещен. Только администратор может отправлять ссылки для сброса пароля",
        });
      }

      const baseUrl = getBaseUrl(req); // ✅ исправлено
      await authService.sendPasswordResetLink(id, baseUrl);

      res.json({
        success: true,
        message: "Ссылка для сброса пароля отправлена на email пользователя",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Ошибка отправки ссылки",
      });
    }
  }

  // ============================================================
  // СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ АДМИНИСТРАТОРОМ
  // ============================================================
  async createUserByAdmin(req: AuthRequest, res: Response) {
    try {
      const currentUser = req.user;

      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({
          success: false,
          error:
            "Доступ запрещен. Только администратор проекта может создавать пользователей",
        });
      }

      const baseUrl = getBaseUrl(req); // ✅ исправлено
      const user = await authService.createUserByAdmin(req.body, baseUrl);

      res.status(201).json({
        success: true,
        message:
          "Пользователь создан. На его email отправлено письмо с подтверждением.",
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
  // СОЗДАНИЕ КОМПАНИИ
  // ============================================================
  async createCompany(req: AuthRequest, res: Response) {
    try {
      const currentUser = req.user;

      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({
          success: false,
          error:
            "Доступ запрещен. Только администратор проекта может создавать компании",
        });
      }

      const { name, phone, address, website, description } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "Название компании обязательно",
        });
      }

      const existing = await authService.getCompanyByName(name);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: `Компания с названием "${name}" уже существует`,
        });
      }

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

      if (
        currentUser.role !== "admin" &&
        currentUser.role !== "developer_admin"
      ) {
        return res.status(403).json({
          success: false,
          error:
            "Доступ запрещен. Только администратор проекта или компании может создавать менеджеров",
        });
      }

      if (currentUser.role === "developer_admin" && !currentUser.companyId) {
        return res.status(403).json({
          success: false,
          error: "У вас нет компании. Вы не можете создавать менеджеров",
        });
      }

      const fullUser = await authService.getUserById(currentUser.id);
      if (!fullUser) {
        return res.status(404).json({
          success: false,
          error: "Пользователь не найден",
        });
      }

      const baseUrl = getBaseUrl(req); // ✅ исправлено
      const user = await authService.createCompanyManager(
        req.body,
        fullUser,
        baseUrl,
      );

      res.status(201).json({
        success: true,
        message:
          "Менеджер создан. На его email отправлено письмо с подтверждением.",
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
          isEmailVerified: u.isEmailVerified,
          emailVerifiedAt: u.emailVerifiedAt,
          lastLoginAt: u.lastLoginAt,
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
