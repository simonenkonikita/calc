// backend/src/entities/Notification.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Company } from "./Company";
import { Complex } from "./Complex";

export type NotificationType =
  // ЖК
  | "complex_created"
  | "complex_updated"
  | "complex_deleted"
  // Типы квартир
  | "apartment_type_added"
  | "apartment_type_removed"
  // Условия оплаты
  | "payment_term_added"
  | "payment_term_removed"
  // Акции
  | "promotion_added"
  | "promotion_removed"
  // Спецпредложения
  | "special_offer_added"
  | "special_offer_removed"
  // Банки
  | "bank_added"
  | "bank_updated"
  | "bank_removed"
  // Офферы
  | "offer_created"
  | "offer_updated"
  | "offer_deleted"
  | "offer_rate_changed"
  | "offer_subsidy_changed";

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 50 })
  type: NotificationType;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "text" })
  message: string;

  @Column({ type: "jsonb", default: {} })
  metadata: {
    complexId?: string;
    complexName?: string;
    field?: string;
    oldValue?: any;
    newValue?: any;
    userId?: string;
    userName?: string;
  };

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isImportant: boolean;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ nullable: true })
  companyId: string;

  @ManyToOne(() => Company, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "companyId" })
  company: Company;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
