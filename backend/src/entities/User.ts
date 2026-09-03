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

  @Column({ nullable: true })
  lastLoginAt: Date;

  // ============================================================
  // 🔥 СВЯЗИ
  // ============================================================

  // 🔥 ИСПРАВЛЯЕМ: добавляем nullable: true
  @Column({ nullable: true })
  companyId: string | null;

  @ManyToOne(() => Company, (company) => company.users, { nullable: true })
  @JoinColumn({ name: "companyId" })
  company: Company | null;

  // 🔥 ИСПРАВЛЯЕМ: добавляем nullable: true
  @Column({ nullable: true })
  createdById: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "createdById" })
  createdBy: User | null;

  @OneToMany(() => User, (user) => user.createdBy)
  createdUsers: User[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
