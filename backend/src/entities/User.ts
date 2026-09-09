// backend/src/entities/User.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Company } from "./Company";
import { Token } from "./Token";
import { Notification } from "./Notification";

export type UserRole =
  | "admin"
  | "developer_admin"
  | "developer_manager"
  | "agent";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({
    type: "enum",
    enum: ["admin", "developer_admin", "developer_manager", "agent"],
    default: "agent",
  })
  role: UserRole;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  position: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "boolean", default: false })
  isEmailVerified: boolean;

  @Column({ type: "timestamp", nullable: true })
  emailVerifiedAt: Date | null;

  @Column({ type: "timestamp", nullable: true })
  lastLoginAt: Date | null;

  // ============================================================
  // 🔥 СВЯЗИ С ПРАВИЛЬНЫМИ onDelete
  // ============================================================

  // ✅ ТОКЕНЫ - CASCADE (безопасно)
  @OneToMany(() => Token, (token) => token.user, {
    cascade: true,
    onDelete: "CASCADE",
  })
  tokens: Token[];

  // ✅ КОМПАНИЯ - SET NULL (компания остается)
  @Column({ nullable: true })
  companyId: string | null;

  @ManyToOne(() => Company, (company) => company.users, {
    nullable: true,
    onDelete: "SET NULL", // ← Компания не удаляется
  })
  @JoinColumn({ name: "companyId" })
  company: Company | null;

  // ✅ КТО СОЗДАЛ - SET NULL
  @Column({ nullable: true })
  createdById: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: "SET NULL", // ← Кто создал не удаляется
  })
  @JoinColumn({ name: "createdById" })
  createdBy: User | null;

  // ✅ СОЗДАННЫЕ ПОЛЬЗОВАТЕЛИ - SET NULL
  @OneToMany(() => User, (user) => user.createdBy, {
    onDelete: "SET NULL", // ← Созданные пользователи остаются
  })
  createdUsers: User[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
