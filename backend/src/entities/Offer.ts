// backend/src/entities/Offer.ts

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
import { Bank } from "./Bank";
import { Program } from "./Program";
import { DynamicRate } from "./DynamicRate";
import { DynamicSubsidy } from "./DynamicSubsidy";
import { User } from "./User";
import { Company } from "./Company";

@Entity("offers")
export class Offer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 200 })
  program: string;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  rate: number;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  twoRate: number | null;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  shortRate: number | null;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  subsidyPercent: number;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  minPVPercent: number;

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
  minLoanAmount: number | null;

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
  maxLoanAmount: number | null;

  @Column({ type: "int", nullable: true })
  minLoanTerm: number | null;

  @Column({ type: "int", nullable: true })
  maxLoanTerm: number | null;

  @Column({ type: "int", nullable: true })
  durationMonths: number | null;

  @Column({ type: "boolean", default: false })
  isTwoContracts: boolean;

  @Column({ type: "boolean", default: false })
  isExcessLimit: boolean;

  @Column({ type: "boolean", default: false })
  isTranche: boolean;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  trancheFirstPercent: number | null;

  @Column({ type: "date", nullable: true })
  trancheSecondDate: string | null;

  @Column({ type: "jsonb", nullable: true })
  complexes: string[] | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  subsidyCalculationMethod: string | null;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  thresholdTolerance: number | null;

  @Column({ type: "varchar", length: 10, nullable: true })
  thresholdToleranceType: string | null;

  @Column({ type: "varchar", length: 10, nullable: true })
  roundingStrategy: string | null;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  // ============================================================
  // 🔥 СВЯЗИ С ПРАВИЛЬНЫМИ onDelete
  // ============================================================

  // ✅ БАНК - RESTRICT (нельзя удалить банк, если есть офферы)
  @ManyToOne(() => Bank, (bank) => bank.offers, {
    onDelete: "RESTRICT", // ← Защита от удаления банка с офферами
  })
  @JoinColumn({ name: "bankId" })
  bank: Bank;

  @Column({ type: "uuid" })
  bankId: string;

  // ✅ ПРОГРАММА - RESTRICT (нельзя удалить программу, если есть офферы)
  @ManyToOne(() => Program, (program) => program.offers, {
    onDelete: "RESTRICT", // ← Защита от удаления программы с офферами
  })
  @JoinColumn({ name: "programId" })
  programEntity: Program;

  @Column({ type: "uuid" })
  programId: string;

  // ✅ ДИНАМИЧЕСКИЕ СТАВКИ - CASCADE (удаляются с оффером)
  @OneToMany(() => DynamicRate, (rate) => rate.offer, {
    cascade: true,
    onDelete: "CASCADE",
  })
  dynamicRates: DynamicRate[];

  // ✅ ДИНАМИЧЕСКИЕ СУБСИДИИ - CASCADE (удаляются с оффером)
  @OneToMany(() => DynamicSubsidy, (subsidy) => subsidy.offer, {
    cascade: true,
    onDelete: "CASCADE",
  })
  dynamicSubsidies: DynamicSubsidy[];

  // ============================================================
  // 🔥 ДОПОЛНИТЕЛЬНЫЕ ПОЛЯ ДЛЯ ИЕРАРХИИ
  // ============================================================

  @Column({ nullable: true })
  companyId: string;

  // ✅ КОМПАНИЯ - SET NULL (безопасно)
  @ManyToOne(() => Company, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "companyId" })
  company: Company;

  @Column({ nullable: true })
  createdById: string;

  // ✅ КТО СОЗДАЛ - SET NULL
  @ManyToOne(() => User, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "createdById" })
  createdBy: User;

  @Column({ nullable: true })
  updatedById: string;

  // ✅ КТО ОБНОВИЛ - SET NULL
  @ManyToOne(() => User, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "updatedById" })
  updatedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
