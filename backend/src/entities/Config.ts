// backend/src/entities/Config.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from "typeorm";

@Entity("config")
export class Config {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100, unique: true })
  key: string;

  @Column({ type: "jsonb" })
  value: any;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
