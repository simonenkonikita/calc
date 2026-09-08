// backend/src/entities/Company.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Complex } from "./Complex";

@Entity("companies")
export class Company {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100, unique: true })
  slug: string;

  @Column({ type: "varchar", length: 200, unique: true })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "varchar", nullable: true })
  logo: string;

  @Column({ type: "varchar", nullable: true })
  website: string;

  @Column({ type: "varchar", nullable: true })
  phone: string;

  @Column({ type: "varchar", nullable: true })
  address: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  // ============================================================
  // 🔥 СВЯЗИ С ПРАВИЛЬНЫМИ onDelete
  // ============================================================

  @Column({ nullable: true })
  adminId: string | null;

  // ✅ АДМИНИСТРАТОР - SET NULL
  @ManyToOne(() => User, {
    nullable: true,
    onDelete: "SET NULL", // ← При удалении пользователя - SET NULL
  })
  @JoinColumn({ name: "adminId" })
  admin: User | null;

  // ✅ ПОЛЬЗОВАТЕЛИ - SET NULL (безопасно)
  @OneToMany(() => User, (user) => user.company, {
    onDelete: "SET NULL", // ← При удалении компании - SET NULL
  })
  users: User[];

  // ✅ КОМПЛЕКСЫ - SET NULL (безопасно)
  @OneToMany(() => Complex, (complex) => complex.company, {
    onDelete: "SET NULL", // ← При удалении компании - SET NULL
  })
  complexes: Complex[];

  @Column({ nullable: true })
  createdById: string | null;

  // ✅ КТО СОЗДАЛ - SET NULL
  @ManyToOne(() => User, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "createdById" })
  createdBy: User | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
