// backend/src/entities/Bank.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import { Offer } from "./Offer";
import { generateSlug } from "../utils/slugify";

@Entity("banks")
export class Bank {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100, unique: true })
  slug: string; // "sber", "alfa", "vtb"

  @Column({ type: "varchar", length: 200, unique: true })
  name: string; // "Сбербанк", "Альфа-Банк"

  @Column({ type: "decimal", precision: 5, scale: 2 })
  baseRate: number;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  minPVPercent: number;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({ type: "int", default: 0 })
  displayOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Offer, (offer) => offer.bank)
  offers: Offer[];

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (!this.slug) {
      this.slug = generateSlug(this.name);
    }
  }
}
