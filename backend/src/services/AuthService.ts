// backend/src/services/AuthService.ts
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entities/User";
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
} from "../dtos/AuthDto";

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  // ============================================================
  // РЕГИСТРАЦИЯ
  // ============================================================
  async register(
    data: RegisterDto,
  ): Promise<{ user: AuthUser; token: string }> {
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
      company: data.company,
      position: data.position,
      role: data.role || "agent",
    });

    await this.userRepository.save(user);

    const token = this.generateToken(user);
    const authUser = this.mapToAuthUser(user);

    return { user: authUser, token };
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
  // ГЕНЕРАЦИЯ JWT
  // ============================================================
  private generateToken(user: User): string {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      company: user.company || undefined,
    };

    return jwt.sign(payload, process.env.JWT_SECRET || "default_secret", {
      expiresIn: "7d",
    });
  }

  // ============================================================
  // ВЕРИФИКАЦИЯ ТОКЕНА
  // ============================================================
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const secret = process.env.JWT_SECRET || "default_secret";
      return jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
      throw new Error("Неверный токен");
    }
  }

  // ============================================================
  // ПОЛУЧЕНИЕ ПОЛЬЗОВАТЕЛЯ ПО ID
  // ============================================================
  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  // ============================================================
  // ПОЛУЧЕНИЕ ПОЛЬЗОВАТЕЛЯ ПО EMAIL
  // ============================================================
  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  // ============================================================
  // ОБНОВЛЕНИЕ ПРОФИЛЯ
  // ============================================================
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

  // ============================================================
  // СМЕНА ПАРОЛЯ
  // ============================================================
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
  // ПОЛУЧЕНИЕ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ
  // ============================================================
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  // ============================================================
  // ОБНОВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ (АДМИН)
  // ============================================================
  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.company !== undefined) user.company = data.company;
    if (data.position !== undefined) user.position = data.position;
    if (data.role !== undefined) user.role = data.role;
    if (data.isActive !== undefined) user.isActive = data.isActive;

    await this.userRepository.save(user);

    return user;
  }

  // ============================================================
  // УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ
  // ============================================================
  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    await this.userRepository.remove(user);
  }

  // ============================================================
  // МАППИНГ User → AuthUser
  // ============================================================
  private mapToAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      company: user.company || undefined,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      phone: user.phone || undefined,
      position: user.position || undefined,
      isActive: user.isActive,
    };
  }
}
