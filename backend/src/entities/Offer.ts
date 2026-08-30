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

  // ============================================================
  // 🔥 ИНДИВИДУАЛЬНЫЕ ЛИМИТЫ ОФЕРА
  // ============================================================
  @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
  minLoanAmount: number | null; // Минимальная сумма кредита для этого офера

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
  maxLoanAmount: number | null; // Максимальная сумма кредита для этого офера

  @Column({ type: "int", nullable: true })
  minLoanTerm: number | null; // Минимальный срок кредита в годах

  @Column({ type: "int", nullable: true })
  maxLoanTerm: number | null; // Максимальный срок кредита в годах

  // ============================================================
  // ОСТАЛЬНЫЕ ПОЛЯ
  // ============================================================
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

  @Column({ type: "int", nullable: true })
  minLoanTermYears: number | null; // ⚠️ УДАЛИТЬ позже (дубликат)

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ============================================================
  // 🔥 СВЯЗИ
  // ============================================================

  @ManyToOne(() => Bank, (bank) => bank.offers)
  @JoinColumn({ name: "bankId" })
  bank: Bank;

  @Column({ type: "uuid" })
  bankId: string;

  @ManyToOne(() => Program, (program) => program.offers)
  @JoinColumn({ name: "programId" })
  programEntity: Program;

  @Column({ type: "uuid" })
  programId: string;

  @OneToMany(() => DynamicRate, (rate) => rate.offer)
  dynamicRates: DynamicRate[];

  @OneToMany(() => DynamicSubsidy, (subsidy) => subsidy.offer)
  dynamicSubsidies: DynamicSubsidy[];
}
