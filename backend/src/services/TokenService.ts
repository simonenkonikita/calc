// backend/src/services/TokenService.ts

import { AppDataSource } from "../data-source";
import { Token, TokenType } from "../entities/Token";
import { User } from "../entities/User";
import { v4 as uuidv4 } from "uuid";

export class TokenService {
  private tokenRepository = AppDataSource.getRepository(Token);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Создать токен для пользователя
   */
  async createToken(
    userId: string,
    type: TokenType,
    expiresInHours: number = 24,
  ): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const tokenEntity = this.tokenRepository.create({
      token,
      type,
      userId,
      expiresAt,
      isUsed: false,
    });

    await this.tokenRepository.save(tokenEntity);
    return token;
  }

  /**
   * Проверить токен
   */
  async verifyToken(token: string, type: TokenType): Promise<User | null> {
    const tokenEntity = await this.tokenRepository.findOne({
      where: { token, type, isUsed: false },
      relations: ["user"],
    });

    if (!tokenEntity) {
      return null;
    }

    if (tokenEntity.expiresAt < new Date()) {
      return null;
    }

    tokenEntity.isUsed = true;
    await this.tokenRepository.save(tokenEntity);

    return tokenEntity.user;
  }

  /**
   * Удалить все токены пользователя по типу
   */
  async deleteUserTokens(userId: string, type: TokenType): Promise<void> {
    await this.tokenRepository.delete({
      userId,
      type,
    });
  }

  /**
   * Очистить просроченные токены
   */
  async cleanExpiredTokens(): Promise<void> {
    await this.tokenRepository
      .createQueryBuilder()
      .delete()
      .where("expiresAt < :now", { now: new Date() })
      .execute();
  }
}
