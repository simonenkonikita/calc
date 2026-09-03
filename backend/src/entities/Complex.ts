// backend/src/entities/Complex.ts

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
import { ApartmentType } from "./ApartmentType";
import { Company } from "./Company";
import { User } from "./User";

@Entity("complexes")
export class Complex {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100, unique: true })
  slug: string;

  @Column({ type: "varchar", length: 200, unique: true })
  name: string;

  @Column({ type: "varchar", length: 50 })
  status: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "jsonb", nullable: true })
  banks: string[];

  @Column({ type: "jsonb", nullable: true })
  paymentTerms: string[];

  @Column({ type: "jsonb", nullable: true })
  promotions: string[];

  @Column({ type: "jsonb", nullable: true })
  specialOffers: string[];

  @Column({ type: "varchar", nullable: true })
  materialsLink: string;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  // ============================================================
  // 🔥 СВЯЗИ
  // ============================================================

  @Column({ nullable: true })
  companyId: string | null;

  // 🔥 ИСПРАВЛЯЕМ: company -> Company
  @ManyToOne(() => Company, (company) => company.complexes, { nullable: true })
  @JoinColumn({ name: "companyId" })
  company: Company | null;

  @Column({ nullable: true })
  createdById: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "createdById" })
  createdBy: User | null;

  @Column({ nullable: true })
  updatedById: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "updatedById" })
  updatedBy: User | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => ApartmentType, (apartmentType) => apartmentType.complex)
  apartmentTypes: ApartmentType[];
}
