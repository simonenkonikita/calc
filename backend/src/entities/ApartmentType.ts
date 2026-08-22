// backend/src/entities/ApartmentType.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Complex } from "./Complex";

@Entity("apartment_types")
export class ApartmentType {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100 })
  type: string; // "Студия", "Однокомнатная квартира" и т.д.

  @Column({ type: "decimal", precision: 12, scale: 2 })
  pricePerSquareMeter: number;

  @Column({ type: "jsonb", nullable: true })
  surcharges: {
    withoutDownPayment: number;
    partialDownPayment: number;
  };

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Complex, (complex) => complex.apartmentTypes)
  @JoinColumn({ name: "complexId" })
  complex: Complex;

  @Column({ type: "uuid" })
  complexId: string;
}
