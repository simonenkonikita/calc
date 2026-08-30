// backend/src/entities/SystemConfig.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("system_config")
export class SystemConfig {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ============================================================
  // 🔥 ГОСУДАРСТВЕННЫЕ ЛИМИТЫ
  // ============================================================

  @Column({ type: "decimal", precision: 15, scale: 2 })
  familyMortgageLimit: number;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  maxFamilyMortgageLimit: number;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  itMortgageLimit: number;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  maxItMortgageLimit: number;

  // ============================================================
  // 🔥 ГРАНИЦЫ ДЛЯ КАЛЬКУЛЯТОРА
  // ============================================================

  @Column({ type: "decimal", precision: 15, scale: 2 })
  minArea: number; // Минимальная площадь

  @Column({ type: "decimal", precision: 15, scale: 2 })
  maxArea: number; // Максимальная площадь

  @Column({ type: "decimal", precision: 5, scale: 2 })
  minDownPaymentPercent: number; // Минимальный ПВ (%)

  @Column({ type: "decimal", precision: 5, scale: 2 })
  maxDownPaymentPercent: number; // Максимальный ПВ (%)

  @Column({ type: "int" })
  minLoanTerm: number; // Минимальный срок (лет)

  @Column({ type: "int" })
  maxLoanTerm: number; // Максимальный срок (лет)

  // ============================================================
  // 🔥 ДОПОЛНИТЕЛЬНЫЕ НАСТРОЙКИ
  // ============================================================

  @Column({ type: "decimal", precision: 15, scale: 2 })
  deposit: number;

  @Column({ type: "jsonb" })
  bankOrder: Array<{
    name: string;
    displayOrder: number;
  }>;

  // ============================================================
  // 🔥 СЛУЖЕБНЫЕ ПОЛЯ
  // ============================================================

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
