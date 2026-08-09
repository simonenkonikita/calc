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

  // 🔥 Условия для применения субсидии
  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  minPVPercent: number;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  maxPVPercent: number;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  minAmount: number;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  maxAmount: number;

  @Column({ type: "int", nullable: true })
  minTerm: number;

  @Column({ type: "int", nullable: true })
  maxTerm: number;

  // 🔥 Результат
  @Column({ type: "decimal", precision: 5, scale: 2 })
  subsidyPercent: number;

  @Column({ type: "int", default: 0 })
  priority: number;

  @Column({ type: "text", nullable: true })
  description: string;

  // 🔥 Дополнительные параметры
  @Column({ type: "varchar", length: 20, nullable: true })
  roundingStrategy: string | null;

  @Column({ type: "jsonb", nullable: true })
  conditionMetadata: any;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 🔥 Связь с оффером
  @ManyToOne(() => Offer, (offer) => offer.dynamicSubsidies)
  @JoinColumn({ name: "offerId" })
  offer: Offer;

  @Column()
  offerId: string;
}
