// backend/src/entities/DynamicSubsidy.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Offer } from "./Offer";

@Entity("dynamic_subsidies")
export class DynamicSubsidy {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ============================================================
  // 🔥 УСЛОВИЯ (КАК В DYNAMIC_RATE)
  // ============================================================

  @Column({ type: "varchar", length: 20, nullable: true })
  conditionType: string;

  @Column({ type: "varchar", length: 10, nullable: true })
  condition: string;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  value: number | null;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  minValue: number | null;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  maxValue: number | null;

  // ============================================================
  // 🔥 РЕЗУЛЬТАТ (СУБСИДИЯ В %)
  // ============================================================

  @Column({ type: "decimal", precision: 5, scale: 2 })
  rate: number; // ← переименовали с subsidyPercent

  @Column({ type: "int", default: 0 })
  priority: number;

  @Column({ type: "text", nullable: true })
  description: string;

  // ============================================================
  // 🔥 ДОПОЛНИТЕЛЬНЫЕ ПАРАМЕТРЫ
  // ============================================================

  @Column({ type: "jsonb", nullable: true })
  conditionMetadata: any;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ============================================================
  // 🔥 СВЯЗЬ С ОФФЕРОМ
  // ============================================================

  @ManyToOne(() => Offer, (offer) => offer.dynamicSubsidies)
  @JoinColumn({ name: "offerId" })
  offer: Offer;

  @Column()
  offerId: string;
}
