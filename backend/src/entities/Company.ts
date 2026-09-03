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
import { Complex } from "./Complex"; // 🔥 ДОБАВЛЯЕМ ИМПОРТ

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
  // 🔥 СВЯЗИ
  // ============================================================

  @Column({ nullable: true })
  adminId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "adminId" })
  admin: User | null;

  @OneToMany(() => User, (user) => user.company)
  users: User[];

  // 🔥 ДОБАВЛЯЕМ СВЯЗЬ С КОМПЛЕКСАМИ
  @OneToMany(() => Complex, (complex) => complex.company)
  complexes: Complex[];

  @Column({ nullable: true })
  createdById: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "createdById" })
  createdBy: User | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
