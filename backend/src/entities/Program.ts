// backend/src/entities/Program.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Offer } from "./Offer";

@Entity("programs")
export class Program {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 50, unique: true })
  type: string;

  @Column({ type: "varchar", length: 100 })
  label: string;

  @Column({ type: "varchar", length: 10, nullable: true, default: "🏦" })
  icon: string;

  @Column({ type: "varchar", length: 20, nullable: true, default: "#6b7280" })
  color: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({ type: "int", default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // 🔥 Связь с офферами (но не загружаем при обновлении)
  @OneToMany(() => Offer, (offer) => offer.programEntity)
  offers: Offer[];
}
