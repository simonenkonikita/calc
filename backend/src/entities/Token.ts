// backend/src/entities/Token.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

export enum TokenType {
  CONFIRM_EMAIL = "confirm_email",
  RESET_PASSWORD = "reset_password",
}

@Entity("tokens")
export class Token {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  token: string;

  @Column({ type: "enum", enum: TokenType })
  type: TokenType;

  @Column({ type: "uuid" })
  userId: string;

  // ✅ ТОКЕН - CASCADE (удаляется с пользователем)
  @ManyToOne(() => User, (user) => user.tokens, {
    onDelete: "CASCADE", // ← Токены удаляются при удалении пользователя
  })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "timestamp" })
  expiresAt: Date;

  @Column({ type: "boolean", default: false })
  isUsed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
