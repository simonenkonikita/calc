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
import { TokenService } from "./TokenService";
import { EmailService } from "./EmailService";
import { TokenType } from "../entities/Token";

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private companyRepository = AppDataSource.getRepository(Company);

  private tokenService: TokenService;
  private emailService: EmailService;

  constructor() {
    this.tokenService = new TokenService();
    this.emailService = new EmailService();
  }

  // ============================================================
  // РЕГИСТРАЦИЯ (ТОЛЬКО ДЛЯ АГЕНТОВ)
  // ============================================================
  async register(
    data: RegisterDto,
    baseUrl: string,
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
      isActive: true,
      isEmailVerified: false,
    });

    await this.userRepository.save(user);

    const verifyToken = await this.tokenService.createToken(
      user.id,
      TokenType.CONFIRM_EMAIL,
      24,
    );

    await this.emailService.sendEmailVerification(user, verifyToken, baseUrl);

    const token = this.generateToken(user);
    const authUser = this.mapToAuthUser(user);

    return { user: authUser, token };
  }

  // ============================================================
  // ПОДТВЕРЖДЕНИЕ EMAIL
  // ============================================================
  async verifyEmail(token: string): Promise<User | null> {
    const user = await this.tokenService.verifyToken(
      token,
      TokenType.CONFIRM_EMAIL,
    );

    if (!user) {
      return null;
    }

    user.isEmailVerified = true;
    user.isActive = true;
    user.emailVerifiedAt = new Date();
    await this.userRepository.save(user);

    return user;
  }

  // ============================================================
  // ОТПРАВКА ССЫЛКИ ДЛЯ СБРОСА ПАРОЛЯ
  // ============================================================
  async sendPasswordReset(email: string, baseUrl: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return;
    }

    await this.tokenService.deleteUserTokens(user.id, TokenType.RESET_PASSWORD);

    const resetToken = await this.tokenService.createToken(
      user.id,
      TokenType.RESET_PASSWORD,
      1,
    );

    await this.emailService.sendPasswordReset(user, resetToken, baseUrl);
  }

  // ============================================================
  // СБРОС ПАРОЛЯ
  // ============================================================
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<User | null> {
    const user = await this.tokenService.verifyToken(
      token,
      TokenType.RESET_PASSWORD,
    );

    if (!user) {
      return null;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return user;
  }

  /**
   * Повторная отправка письма подтверждения
   */
  async resendVerification(userId: string, baseUrl: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    if (user.isEmailVerified) {
      throw new Error("Email уже подтвержден");
    }

    await this.tokenService.deleteUserTokens(user.id, TokenType.CONFIRM_EMAIL);

    const verifyToken = await this.tokenService.createToken(
      user.id,
      TokenType.CONFIRM_EMAIL,
      24,
    );

    await this.emailService.sendEmailVerification(user, verifyToken, baseUrl);
  }

  // ============================================================
  // СОЗДАНИЕ КОМПАНИИ
  // ============================================================
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
  // СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ АДМИНИСТРАТОРОМ (ТОЛЬКО АДМИН)
  // ============================================================
  async createUserByAdmin(
    data: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      role?: string;
      companyId?: string;
      position?: string;
    },
    baseUrl?: string,
  ): Promise<Omit<User, "password">> {
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error(`Пользователь с email "${data.email}" уже существует`);
    }

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

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      phone: data.phone || "",
      role: role,
      companyId: data.companyId || null,
      position: data.position || "",
      isActive: false,
      isEmailVerified: false,
    });

    await this.userRepository.save(user);

    if (baseUrl) {
      try {
        const verifyToken = await this.tokenService.createToken(
          user.id,
          TokenType.CONFIRM_EMAIL,
          24,
        );
        await this.emailService.sendEmailVerification(
          user,
          verifyToken,
          baseUrl,
        );
      } catch (error) {
        console.error("❌ Failed to send verification email:", error);
      }
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, "password">;
  }

  // ============================================================
  // СОЗДАНИЕ МЕНЕДЖЕРА КОМПАНИИ
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
    baseUrl?: string,
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
      isActive: false,
      isEmailVerified: false,
    });

    await this.userRepository.save(manager);

    if (baseUrl) {
      try {
        const verifyToken = await this.tokenService.createToken(
          manager.id,
          TokenType.CONFIRM_EMAIL,
          24,
        );
        await this.emailService.sendEmailVerification(
          manager,
          verifyToken,
          baseUrl,
        );
      } catch (error) {
        console.error("❌ Failed to send verification email:", error);
      }
    }

    return manager;
  }

  // ============================================================
  // СБРОС ПАРОЛЯ (из админки)
  // ============================================================
  async resetPasswordByAdmin(
    userId: string,
    newPassword: string,
    baseUrl: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    try {
      await this.emailService.sendPasswordChangedEmail(user, baseUrl);
    } catch (error) {
      console.error("❌ Failed to send password change notification:", error);
    }

    return user;
  }

  // ============================================================
  // ОТПРАВКА ССЫЛКИ ДЛЯ СБРОСА ПАРОЛЯ (из админки)
  // ============================================================
  async sendPasswordResetLink(userId: string, baseUrl: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    await this.tokenService.deleteUserTokens(user.id, TokenType.RESET_PASSWORD);

    const resetToken = await this.tokenService.createToken(
      user.id,
      TokenType.RESET_PASSWORD,
      1,
    );

    await this.emailService.sendPasswordReset(user, resetToken, baseUrl);
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

    if (!user.isEmailVerified) {
      throw new Error("Email не подтвержден. Проверьте вашу почту.");
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
    if (currentUser.role === "admin") {
      return this.userRepository.find({
        relations: ["company"],
        order: { createdAt: "DESC" },
      });
    }

    if (currentUser.role === "developer_admin") {
      if (!currentUser.companyId) {
        return [];
      }

      return this.userRepository.find({
        where: { companyId: currentUser.companyId },
        relations: ["company"],
        order: { createdAt: "DESC" },
      });
    }

    if (currentUser.role === "developer_manager") {
      return this.userRepository.find({
        where: { id: currentUser.id },
        relations: ["company"],
      });
    }

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

    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.position !== undefined) user.position = data.position;
    if (data.isActive !== undefined) user.isActive = data.isActive;

    if (data.password && data.password.length >= 6) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      user.password = hashedPassword;
    }

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

      if (
        user.role === "developer_admin" &&
        user.companyId &&
        (oldRole !== "developer_admin" || oldCompanyId !== user.companyId)
      ) {
        const company = await this.companyRepository.findOne({
          where: { id: user.companyId },
        });

        if (company) {
          company.adminId = user.id;
          await this.companyRepository.save(company);
        }
      }

      if (
        oldRole === "developer_admin" &&
        oldCompanyId &&
        user.role !== "developer_admin"
      ) {
        const company = await this.companyRepository.findOne({
          where: { id: oldCompanyId },
        });

        if (company && company.adminId === user.id) {
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

    const company = await this.companyRepository.findOne({
      where: { adminId: user.id },
    });

    if (company) {
      company.adminId = null;
      company.admin = null;
      await this.companyRepository.save(company);
    }

    await this.userRepository.remove(user);
  }

  // ============================================================
  // УПРАВЛЕНИЕ КОМПАНИЯМИ
  // ============================================================
  async getCompanies(): Promise<Company[]> {
    return this.companyRepository.find({
      relations: ["admin", "users"],
      order: { name: "ASC" },
    });
  }

  async getCompanyById(id: string): Promise<Company | null> {
    return this.companyRepository.findOne({
      where: { id },
      relations: ["admin", "users"],
    });
  }

  async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ["admin", "users"],
    });

    if (!company) {
      throw new Error("Компания не найдена");
    }

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

  async deleteCompany(id: string): Promise<void> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ["users"],
    });

    if (!company) {
      throw new Error("Компания не найдена");
    }

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
      isEmailVerified: user.isEmailVerified,
      emailVerifiedAt: user.emailVerifiedAt || undefined,
      lastLoginAt: user.lastLoginAt || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
