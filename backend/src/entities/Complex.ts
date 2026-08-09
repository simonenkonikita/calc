// backend/src/entities/Complex.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ApartmentType } from "./ApartmentType";

@Entity("complexes")
export class Complex {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100, unique: true })
  slug: string;

  @Column({ type: "varchar", length: 200, unique: true })
  name: string;

  @Column({ type: "varchar", length: 50 })
  status: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "jsonb", nullable: true })
  banks: string[];

  @Column({ type: "jsonb", nullable: true })
  paymentTerms: string[];

  @Column({ type: "jsonb", nullable: true })
  promotions: string[];

  @Column({ type: "jsonb", nullable: true })
  specialOffers: string[];

  @Column({ type: "varchar", nullable: true })
  materialsLink: string;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ApartmentType, (apartmentType) => apartmentType.complex)
  apartmentTypes: ApartmentType[];
}
