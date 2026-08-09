// backend/src/entities/DynamicRate.ts

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

@Entity("dynamic_rates")
export class DynamicRate {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // 🔥 Основные поля для conditionFn
  @Column({ type: "varchar", length: 20, nullable: true })
  conditionType: string; // 'pv' | 'amount' | 'term'

  @Column({ type: "varchar", length: 10, nullable: true })
  condition: string; // 'gte' | 'lte' | 'between'

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  value: number; // для gte/lte

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  minValue: number; // для between

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  maxValue: number; // для between

  // 🔥 Дополнительные поля для сложных условий
  @Column({ type: "jsonb", nullable: true })
  conditionMetadata: any; // для хранения дополнительных параметров

  // 🔥 Результат
  @Column({ type: "decimal", precision: 5, scale: 2 })
  rate: number;

  @Column({ type: "int", default: 0 })
  priority: number;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 🔥 Связь с оффером
  @ManyToOne(() => Offer, (offer) => offer.dynamicRates)
  @JoinColumn({ name: "offerId" })
  offer: Offer;

  @Column()
  offerId: string;
}
