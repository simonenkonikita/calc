// backend/src/entities/Notification.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./User";
import { Company } from "./Company";

// ============================================================
// 🔥 ТИПЫ УВЕДОМЛЕНИЙ
// ============================================================

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

// ============================================================
// 🔥 МЕТАДАННЫЕ УВЕДОМЛЕНИЯ
// ============================================================

export interface NotificationMetadata {
  // Сущность
  entityId?: string;
  entityName?: string;
  complexId?: string;
  complexName?: string;
  bankId?: string;
  bankName?: string;
  offerId?: string;
  programName?: string;
  paymentTermId?: string;

  // Изменения
  changes?: string[];
  added?: string[];
  removed?: string[];
  field?: string;
  oldValue?: any;
  newValue?: any;

  // Пользователь
  userId?: string;
  userName?: string;

  // Дополнительно
  [key: string]: any;
}

// ============================================================
// 🔥 СУЩНОСТЬ
// ============================================================

@Entity("notifications")
@Index(["userId", "isRead"]) // 🔥 Индекс для быстрого поиска непрочитанных
@Index(["companyId", "createdAt"]) // 🔥 Индекс для сортировки
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ============================================================
  // ТИП УВЕДОМЛЕНИЯ
  // ============================================================
  @Column({ type: "varchar", length: 50 })
  type: NotificationType;

  // ============================================================
  // КОНТЕНТ
  // ============================================================
  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "text" })
  message: string;

  // ============================================================
  // МЕТАДАННЫЕ (JSON)
  // ============================================================
  @Column({ type: "jsonb", default: {} })
  metadata: NotificationMetadata;

  // ============================================================
  // СТАТУСЫ
  // ============================================================
  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isImportant: boolean;

  // ============================================================
  // СВЯЗЬ С ПОЛЬЗОВАТЕЛЕМ
  // ============================================================
  @Column({ nullable: true })
  userId: string | null;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "userId" })
  user: User | null;

  // ============================================================
  // СВЯЗЬ С КОМПАНИЕЙ
  // ============================================================
  @Column({ nullable: true })
  companyId: string | null;

  @ManyToOne(() => Company, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "companyId" })
  company: Company | null;

  // ============================================================
  // ВРЕМЕННЫЕ МЕТКИ
  // ============================================================
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}