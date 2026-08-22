// backend/src/services/AuthService.ts
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CreateUserDto, UpdateUserDto, UserResponseDto } from "../dtos/UserDto";

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  // ============================================================
  // РЕГИСТРАЦИЯ
  // ============================================================
  async register(data: CreateUserDto): Promise<UserResponseDto> {
    // Проверка существования пользователя
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("Пользователь с таким email уже существует");
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Создание пользователя
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

    return this.toResponseDto(user);
  }

  // ============================================================
  // ВХОД
  // ============================================================
  async login(
    email: string,
    password: string,
  ): Promise<{ user: UserResponseDto; token: string }> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new Error("Неверный email или пароль");
    }

    if (!user.isActive) {
      throw new Error("Учетная запись деактивирована");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Неверный email или пароль");
    }

    // Обновляем время последнего входа
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const token = this.generateToken(user);

    return {
      user: this.toResponseDto(user),
      token,
    };
  }

  // ============================================================
  // JWT ГЕНЕРАЦИЯ
  // ============================================================
  private generateToken(user: User): string {
    const secret = process.env.JWT_SECRET || "default_secret";
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        company: user.company,
      },
      secret,
      { expiresIn: "7d" },
    );
  }

  // ============================================================
  // ПРОВЕРКА ТОКЕНА
  // ============================================================
  async verifyToken(token: string): Promise<any> {
    try {
      const secret = process.env.JWT_SECRET || "default_secret";
      return jwt.verify(token, secret);
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
  // ПОЛУЧЕНИЕ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ
  // ============================================================
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      order: { createdAt: "DESC" },
    });
    return users.map((user) => this.toResponseDto(user));
  }

  // ============================================================
  // ОБНОВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ
  // ============================================================
  async updateUser(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    // Обновляем только переданные поля
    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.company !== undefined) user.company = data.company;
    if (data.position !== undefined) user.position = data.position;
    if (data.role !== undefined) user.role = data.role;
    if (data.isActive !== undefined) user.isActive = data.isActive;

    await this.userRepository.save(user);

    return this.toResponseDto(user);
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
  // ПРОВЕРКА ПРАВ ДОСТУПА
  // ============================================================
  canAccessResource(user: User, resource: any): boolean {
    // Администратор проекта - полный доступ
    if (user.role === "admin") {
      return true;
    }

    // Агент - только просмотр
    if (user.role === "agent") {
      return true; // Имеет доступ ко всему, но только на чтение
    }

    // Администратор застройщика - доступ только к своей компании
    if (user.role === "developer_admin") {
      return resource.company === user.company;
    }

    // Менеджер застройщика - доступ только к своей компании
    if (user.role === "developer_manager") {
      return resource.company === user.company;
    }

    return false;
  }

  // ============================================================
  // ПРОВЕРКА НА РЕДАКТИРОВАНИЕ
  // ============================================================
  canEditResource(user: User, resource: any): boolean {
    // Администратор проекта - может редактировать все
    if (user.role === "admin") {
      return true;
    }

    // Агент - НЕ может редактировать
    if (user.role === "agent") {
      return false;
    }

    // Администратор застройщика - может редактировать только свою компанию
    if (user.role === "developer_admin") {
      return resource.company === user.company;
    }

    // Менеджер застройщика - может редактировать только свою компанию
    if (user.role === "developer_manager") {
      return resource.company === user.company;
    }

    return false;
  }

  // ============================================================
  // ТОЛЬКО ДЛЯ АДМИНА
  // ============================================================
  isAdmin(user: User): boolean {
    return user.role === "admin";
  }

  // ============================================================
  // ТОЛЬКО ДЛЯ ЗАСТРОЙЩИКА
  // ============================================================
  isDeveloper(user: User): boolean {
    return user.role === "developer_admin" || user.role === "developer_manager";
  }

  // ============================================================
  // ТОЛЬКО ДЛЯ АГЕНТА
  // ============================================================
  isAgent(user: User): boolean {
    return user.role === "agent";
  }

  // ============================================================
  // ПРЕОБРАЗОВАНИЕ В DTO
  // ============================================================
  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      role: user.role,
      company: user.company || "",
      position: user.position || "",
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
