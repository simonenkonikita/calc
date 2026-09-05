// backend/src/services/AuthService.ts
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entities/User";
import { Company } from "../entities/Company";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Response } from "express";
import { AuthUser, JwtPayload } from "../types/auth.types";
import {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
  UpdateUserDto,
  CreateUserByAdminDto,
} from "../dtos/AuthDto";

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private companyRepository = AppDataSource.getRepository(Company);

  // ============================================================
  // РЕГИСТРАЦИЯ (ТОЛЬКО ДЛЯ АГЕНТОВ)
  // ============================================================
  async register(
    data: RegisterDto,
  ): Promise<{ user: AuthUser; token: string }> {
    if (data.role && data.role !== "agent") {
      throw new Error("Публичная регистрация доступна только для агентов");
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("Пользователь с таким email уже существует");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: "agent",
    });

    await this.userRepository.save(user);

    const token = this.generateToken(user);
    const authUser = this.mapToAuthUser(user);

    return { user: authUser, token };
  }

  // ============================================================
  // СОЗДАНИЕ КОМПАНИИ И ПЕРВОГО АДМИНИСТРАТОРА (ТОЛЬКО АДМИН)
  // ============================================================
  /**
   * Создать компанию без администратора
   */
  async createCompany(data: {
    name: string;
    phone?: string;
    address?: string;
    website?: string;
    isActive?: boolean;
    createdById?: string;
  }): Promise<Company> {
    const { generateSlug } = await import("../utils/slugify");
    const slug = generateSlug(data.name);

    const company = this.companyRepository.create({
      name: data.name,
      slug: slug,
      phone: data.phone || "",
      address: data.address || "",
      website: data.website || "",
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdById: data.createdById || null,
    });

    await this.companyRepository.save(company);
    return company;
  }

  /**
   * Найти компанию по названию
   */
  async getCompanyByName(name: string): Promise<Company | null> {
    return this.companyRepository.findOne({
      where: { name },
    });
  }

  // ============================================================
  // 🔥 СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ АДМИНИСТРАТОРОМ (ТОЛЬКО АДМИН)
  // ============================================================
  async createUserByAdmin(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
    companyId?: string;
    position?: string;
  }): Promise<Omit<User, "password">> {
    // Проверяем, что пользователь не существует
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error(`Пользователь с email "${data.email}" уже существует`);
    }

    // Валидируем роль
    const validRoles: UserRole[] = [
      "admin",
      "developer_admin",
      "developer_manager",
      "agent",
    ];
    const role =
      data.role && validRoles.includes(data.role as UserRole)
        ? (data.role as UserRole)
        : "developer_manager";

    // Хешируем пароль (сохраняем только хеш!)
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Создаем пользователя
    const user = this.userRepository.create({
      email: data.email,
      password: hashedPassword, // ← сохраняем хеш
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      phone: data.phone || "",
      role: role,
      companyId: data.companyId || null,
      position: data.position || "",
      isActive: true,
    });

    await this.userRepository.save(user);

    // 🔥 Возвращаем пользователя БЕЗ пароля
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, "password">;
  }

  // ============================================================
  // СОЗДАНИЕ МЕНЕДЖЕРА КОМПАНИИ (АДМИН КОМПАНИИ)
  // ============================================================
  async createCompanyManager(
    data: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      position?: string;
      phone?: string;
      companyId?: string;
    },
    currentUser: User,
  ): Promise<User> {
    if (
      currentUser.role !== "admin" &&
      currentUser.role !== "developer_admin"
    ) {
      throw new Error(
        "Доступ запрещен. Только администратор компании может создавать менеджеров",
      );
    }

    if (currentUser.role === "developer_admin" && !currentUser.companyId) {
      throw new Error("У вас нет компании");
    }

    const companyId =
      currentUser.role === "admin"
        ? data.companyId || currentUser.companyId
        : currentUser.companyId;

    if (!companyId) {
      throw new Error("Не указана компания");
    }

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new Error("Компания не найдена");
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error(`Пользователь с email "${data.email}" уже существует`);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const manager = this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      phone: data.phone || "",
      position: data.position || "",
      role: "developer_manager",
      companyId: companyId,
      company: company,
      createdById: currentUser.id,
    });

    await this.userRepository.save(manager);

    return manager;
  }

  // ============================================================
  // ВХОД
  // ============================================================
  async login(
    data: LoginDto,
    res: Response,
  ): Promise<{ user: AuthUser; token: string }> {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
      relations: ["company"],
    });

    if (!user) {
      throw new Error("Неверный email или пароль");
    }

    if (!user.isActive) {
      throw new Error("Учетная запись деактивирована");
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      throw new Error("Неверный email или пароль");
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const token = this.generateToken(user);
    const authUser = this.mapToAuthUser(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return { user: authUser, token };
  }

  // ============================================================
  // ВЫХОД
  // ============================================================
  logout(res: Response): void {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  // ============================================================
  // ТОКЕНЫ
  // ============================================================
  private generateToken(user: User): string {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId || undefined,
    };

    return jwt.sign(payload, process.env.JWT_SECRET || "default_secret", {
      expiresIn: "7d",
    });
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const secret = process.env.JWT_SECRET || "default_secret";
      return jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
      throw new Error("Неверный токен");
    }
  }

  // ============================================================
  // ПОЛУЧЕНИЕ ПОЛЬЗОВАТЕЛЕЙ
  // ============================================================
  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ["company"],
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ["company"],
    });
  }

  async updateProfile(id: string, data: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.position !== undefined) user.position = data.position;

    await this.userRepository.save(user);

    return user;
  }

  async changePassword(id: string, data: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    const isValid = await bcrypt.compare(data.oldPassword, user.password);
    if (!isValid) {
      throw new Error("Старый пароль неверен");
    }

    user.password = await bcrypt.hash(data.newPassword, 10);
    await this.userRepository.save(user);
  }

  // ============================================================
  // ПОЛУЧЕНИЕ ПОЛЬЗОВАТЕЛЕЙ С УЧЕТОМ ПРАВ
  // ============================================================

  async getAllUsers(currentUser: User): Promise<User[]> {
    console.log("🔍 getAllUsers - currentUser role:", currentUser.role);
    console.log(
      "🔍 getAllUsers - currentUser companyId:",
      currentUser.companyId,
    );

    // Admin видит всех
    if (currentUser.role === "admin") {
      const users = await this.userRepository.find({
        relations: ["company"],
        order: { createdAt: "DESC" },
      });
      console.log(`✅ Admin: found ${users.length} users`);
      return users;
    }

    // developer_admin видит только пользователей своей компании
    if (currentUser.role === "developer_admin") {
      if (!currentUser.companyId) {
        console.log("⚠️ developer_admin has no company");
        return [];
      }

      const users = await this.userRepository.find({
        where: { companyId: currentUser.companyId },
        relations: ["company"],
        order: { createdAt: "DESC" },
      });
      console.log(
        `✅ developer_admin: found ${users.length} users for company ${currentUser.companyId}`,
      );
      return users;
    }

    // developer_manager видит только себя
    if (currentUser.role === "developer_manager") {
      const users = await this.userRepository.find({
        where: { id: currentUser.id },
        relations: ["company"],
      });
      console.log(`✅ developer_manager: found ${users.length} users`);
      return users;
    }

    // agent и другие роли не видят пользователей
    console.log(`⚠️ Unknown role: ${currentUser.role}, returning empty array`);
    return [];
  }

  async getUsersByCompany(
    companyId: string,
    currentUser: User,
  ): Promise<User[]> {
    if (
      currentUser.role !== "admin" &&
      currentUser.role !== "developer_admin"
    ) {
      throw new Error("Доступ запрещен");
    }

    if (
      currentUser.role === "developer_admin" &&
      currentUser.companyId !== companyId
    ) {
      throw new Error("Доступ запрещен. Вы не принадлежите этой компании");
    }

    return this.userRepository.find({
      where: { companyId },
      relations: ["company"],
      order: { createdAt: "DESC" },
    });
  }

  // ============================================================
  // ОБНОВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ
  // ============================================================
  async updateUser(
    id: string,
    data: UpdateUserDto,
    currentUser: User,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["company"],
    });

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    // Проверяем права
    if (currentUser.role === "admin") {
      // Admin может редактировать всех
    } else if (currentUser.role === "developer_admin") {
      if (user.companyId !== currentUser.companyId) {
        throw new Error(
          "Доступ запрещен. Вы можете редактировать только пользователей своей компании",
        );
      }
      if (
        data.role &&
        (data.role === "admin" || data.role === "developer_admin")
      ) {
        throw new Error(
          "Доступ запрещен. Вы не можете назначать администраторов",
        );
      }
    } else {
      throw new Error("Доступ запрещен. Недостаточно прав");
    }

    // Обновляем поля
    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.position !== undefined) user.position = data.position;
    if (data.isActive !== undefined) user.isActive = data.isActive;

    // 🔥 Только admin может менять роль и компанию
    if (currentUser.role === "admin") {
      const oldRole = user.role;
      const oldCompanyId = user.companyId;

      if (data.role !== undefined) {
        user.role = data.role;
      }

      if (data.companyId !== undefined) {
        user.companyId = data.companyId;

        if (data.companyId) {
          const company = await this.companyRepository.findOne({
            where: { id: data.companyId },
          });
          user.company = company || null;
        } else {
          user.company = null;
        }
      }

      // 🔥 ЕСЛИ ПОЛЬЗОВАТЕЛЬ СТАЛ АДМИНИСТРАТОРОМ КОМПАНИИ
      if (
        user.role === "developer_admin" &&
        user.companyId &&
        (oldRole !== "developer_admin" || oldCompanyId !== user.companyId)
      ) {
        // Находим компанию
        const company = await this.companyRepository.findOne({
          where: { id: user.companyId },
        });

        if (company) {
          // 🔥 Обновляем adminId в компании
          company.adminId = user.id;
          await this.companyRepository.save(company);
        }
      }

      // 🔥 ЕСЛИ ПОЛЬЗОВАТЕЛЬ БЫЛ АДМИНИСТРАТОРОМ, А ТЕПЕРЬ НЕТ
      if (
        oldRole === "developer_admin" &&
        oldCompanyId &&
        user.role !== "developer_admin"
      ) {
        const company = await this.companyRepository.findOne({
          where: { id: oldCompanyId },
        });

        if (company && company.adminId === user.id) {
          // 🔥 Убираем adminId из компании
          company.adminId = null;
          await this.companyRepository.save(company);
        }
      }
    }

    await this.userRepository.save(user);

    return user;
  }

  // ============================================================
  // УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ
  // ============================================================
  async deleteUser(id: string, currentUser: User): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["company"],
    });

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    // Проверка прав
    if (currentUser.role === "admin") {
      // Admin может удалять всех
    } else if (currentUser.role === "developer_admin") {
      if (user.companyId !== currentUser.companyId) {
        throw new Error(
          "Доступ запрещен. Вы можете удалять только пользователей своей компании",
        );
      }
      if (user.role === "admin" || user.role === "developer_admin") {
        throw new Error(
          "Доступ запрещен. Вы не можете удалять администраторов",
        );
      }
      if (user.role !== "developer_manager") {
        throw new Error("Доступ запрещен. Вы можете удалять только менеджеров");
      }
    } else {
      throw new Error("Доступ запрещен. Недостаточно прав");
    }

    if (user.id === currentUser.id) {
      throw new Error("Нельзя удалить самого себя");
    }

    // 🔥 1. Проверяем, является ли пользователь администратором компании
    const company = await this.companyRepository.findOne({
      where: { adminId: user.id },
    });

    if (company) {
      // 🔥 2. Убираем связь с компанией
      company.adminId = null;
      company.admin = null;
      await this.companyRepository.save(company);
      console.log(
        `✅ Убрана связь администратора ${user.email} с компанией ${company.name}`,
      );
    }

    // 🔥 3. Удаляем пользователя
    await this.userRepository.remove(user);
    console.log(`✅ Пользователь ${user.email} удален`);
  }

  // ============================================================
  // 🔥 УПРАВЛЕНИЕ КОМПАНИЯМИ
  // ============================================================

  /**
   * Получить все компании
   */
  async getCompanies(): Promise<Company[]> {
    return this.companyRepository.find({
      relations: ["admin", "users"],
      order: { name: "ASC" },
    });
  }

  /**
   * Получить компанию по ID
   */
  async getCompanyById(id: string): Promise<Company | null> {
    return this.companyRepository.findOne({
      where: { id },
      relations: ["admin", "users"],
    });
  }

  /**
   * Обновить компанию
   */
  async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ["admin", "users"],
    });

    if (!company) {
      throw new Error("Компания не найдена");
    }

    // Обновляем поля
    if (data.name !== undefined) company.name = data.name;
    if (data.slug !== undefined) {
      if (data.name && data.name !== company.name) {
        const { generateSlug } = await import("../utils/slugify");
        company.slug = generateSlug(data.name);
      } else {
        company.slug = data.slug;
      }
    }
    if (data.description !== undefined) company.description = data.description;
    if (data.logo !== undefined) company.logo = data.logo;
    if (data.website !== undefined) company.website = data.website;
    if (data.phone !== undefined) company.phone = data.phone;
    if (data.address !== undefined) company.address = data.address;
    if (data.metadata !== undefined) company.metadata = data.metadata;
    if (data.isActive !== undefined) company.isActive = data.isActive;

    // Если меняется adminId
    if (data.adminId !== undefined) {
      company.adminId = data.adminId;
      if (data.adminId) {
        const admin = await this.userRepository.findOne({
          where: { id: data.adminId },
        });
        company.admin = admin || null;
      } else {
        company.admin = null;
      }
    }

    await this.companyRepository.save(company);

    return this.getCompanyById(id) as Promise<Company>;
  }

  /**
   * Удалить компанию
   */
  async deleteCompany(id: string): Promise<void> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ["users"],
    });

    if (!company) {
      throw new Error("Компания не найдена");
    }

    // Отвязываем всех пользователей компании
    if (company.users && company.users.length > 0) {
      for (const user of company.users) {
        user.companyId = null;
        user.company = null;
        await this.userRepository.save(user);
      }
    }

    await this.companyRepository.remove(company);
  }

  // ============================================================
  // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
  // ============================================================

  private mapToAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId || undefined,
      companyName: user.company?.name || undefined,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      phone: user.phone || undefined,
      position: user.position || undefined,
      isActive: user.isActive,
    };
  }
}
