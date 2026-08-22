// backend/src/entities/DynamicRate.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Offer } from "./Offer";

@Entity("dynamic_rates")
export class DynamicRate {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "offer_id" })
  offerId: string;

  @ManyToOne(() => Offer)
  @JoinColumn({ name: "offer_id" })
  offer: Offer;

  // 🔥 УСЛОВИЯ
  @Column({ name: "condition_metadata", type: "jsonb", default: {} })
  conditionMetadata: {
    amountMin?: number;
    amountMax?: number;
    pvMin?: number;
    pvMax?: number;
    termMin?: number;
    termMax?: number;
  };

  // Результат
  @Column({ type: "numeric" })
  rate: number;

  // 🔥 ПРИОРИТЕТ (добавляем)
  @Column({ default: 0 })
  priority: number;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
