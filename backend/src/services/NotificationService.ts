// backend/src/services/NotificationService.ts

import { AppDataSource } from "../data-source";
import {
  Notification,
  NotificationType,
  NotificationMetadata,
} from "../entities/Notification";
import { User } from "../entities/User";
import { Company } from "../entities/Company";
import { LessThan } from "typeorm";

export class NotificationService {
  private notificationRepository = AppDataSource.getRepository(Notification);
  private userRepository = AppDataSource.getRepository(User);
  private companyRepository = AppDataSource.getRepository(Company);

  // ============================================================
  // 🔥 ОСНОВНОЙ МЕТОД
  // ============================================================

  /**
   * Создать уведомление
   * Если userId не указан — уведомляем всех пользователей компании
   */
  async notify(
    companyId: string | null | undefined,
    data: {
      type: NotificationType;
      title: string;
      message: string;
      metadata?: NotificationMetadata;
      isImportant?: boolean;
      userId?: string;
    },
  ): Promise<void> {
    if (!companyId) return;

    // Если указан конкретный пользователь — уведомляем только его
    if (data.userId) {
      await this.createNotification({
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata,
        isImportant: data.isImportant,
        userId: data.userId,
        companyId,
      });
      return;
    }

    // Иначе уведомляем всех пользователей компании + админов системы
    await this.notifyCompanyUsers(companyId, data);
  }

  // ============================================================
  // 🔥 МЕТОДЫ ДЛЯ КОНКРЕТНЫХ СОБЫТИЙ
  // ============================================================

  async notifyComplexCreated(
    complex: { id: string; name: string; companyId?: string | null },
    user: { id: string; firstName?: string; lastName?: string },
  ): Promise<void> {
    if (!complex.companyId) return;

    await this.notify(complex.companyId, {
      type: "complex_created",
      title: "🏗️ Новый жилой комплекс",
      message: `Добавлен новый ЖК "${complex.name}"`,
      metadata: {
        complexId: complex.id,
        complexName: complex.name,
        entityId: complex.id,
        entityName: complex.name,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
      isImportant: true,
    });
  }

  async notifyComplexChanges(
    complex: { id: string; name: string; companyId?: string | null },
    changes: string[],
    user: { id: string; firstName?: string; lastName?: string },
    metadata?: NotificationMetadata,
  ): Promise<void> {
    if (!complex.companyId || changes.length === 0) return;

    const title =
      changes.length > 1
        ? `📝 Изменения в ЖК "${complex.name}"`
        : `📝 Обновление ЖК "${complex.name}"`;

    const message =
      changes.length > 1
        ? `Изменены: ${changes.join(", ")}`
        : `Изменен параметр: ${changes[0]}`;

    await this.notify(complex.companyId, {
      type: "complex_updated",
      title,
      message,
      metadata: {
        complexId: complex.id,
        complexName: complex.name,
        entityId: complex.id,
        entityName: complex.name,
        changes,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        ...metadata,
      },
      isImportant: changes.length > 1,
    });
  }

  async notifyBankGlobal(
    companyId: string,
    bankName: string,
    action: "added" | "removed",
    user: { id: string; firstName?: string; lastName?: string },
  ): Promise<void> {
    const isAdded = action === "added";

    await this.notify(companyId, {
      type: isAdded ? "bank_added" : "bank_removed",
      title: isAdded ? "🏦 Новый банк-партнер" : "🏦 Банк больше не партнер",
      message: isAdded
        ? `Добавлен новый банк "${bankName}"`
        : `Банк "${bankName}" больше не является партнером`,
      metadata: {
        bankName,
        entityName: bankName,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
      isImportant: true,
    });
  }

  async notifyBankUpdated(
    companyId: string,
    bankName: string,
    changes: string[],
    user: { id: string; firstName?: string; lastName?: string },
  ): Promise<void> {
    if (changes.length === 0) return;

    await this.notify(companyId, {
      type: "bank_updated",
      title: "📝 Обновление банка-партнера",
      message: `Обновлены параметры банка "${bankName}": ${changes.join(", ")}`,
      metadata: {
        bankName,
        entityName: bankName,
        changes,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
      isImportant: changes.length > 1,
    });
  }

  async notifyPaymentTermChange(
    complex: { id: string; name: string; companyId?: string | null },
    term: string,
    action: "added" | "removed",
    user: { id: string; firstName?: string; lastName?: string },
  ): Promise<void> {
    if (!complex.companyId) return;

    const isAdded = action === "added";

    await this.notify(complex.companyId, {
      type: isAdded ? "payment_term_added" : "payment_term_removed",
      title: isAdded ? "💳 Новое условие оплаты" : "💳 Условие оплаты удалено",
      message: isAdded
        ? `В ЖК "${complex.name}" добавлено условие оплаты: "${term}"`
        : `Из ЖК "${complex.name}" удалено условие оплаты: "${term}"`,
      metadata: {
        complexId: complex.id,
        complexName: complex.name,
        entityId: complex.id,
        entityName: complex.name,
        newValue: isAdded ? term : undefined,
        oldValue: !isAdded ? term : undefined,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
    });
  }

  async notifyPromotionChange(
    complex: { id: string; name: string; companyId?: string | null },
    promotion: string,
    action: "added" | "removed",
    user: { id: string; firstName?: string; lastName?: string },
  ): Promise<void> {
    if (!complex.companyId) return;

    const isAdded = action === "added";

    await this.notify(complex.companyId, {
      type: isAdded ? "promotion_added" : "promotion_removed",
      title: isAdded ? "🔥 Новая акция" : "🔥 Акция удалена",
      message: isAdded
        ? `В ЖК "${complex.name}" добавлена акция: "${promotion}"`
        : `Из ЖК "${complex.name}" удалена акция: "${promotion}"`,
      metadata: {
        complexId: complex.id,
        complexName: complex.name,
        entityId: complex.id,
        entityName: complex.name,
        newValue: isAdded ? promotion : undefined,
        oldValue: !isAdded ? promotion : undefined,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
    });
  }

  async notifySpecialOfferChange(
    complex: { id: string; name: string; companyId?: string | null },
    offer: string,
    action: "added" | "removed",
    user: { id: string; firstName?: string; lastName?: string },
  ): Promise<void> {
    if (!complex.companyId) return;

    const isAdded = action === "added";

    await this.notify(complex.companyId, {
      type: isAdded ? "special_offer_added" : "special_offer_removed",
      title: isAdded
        ? "⭐ Новое спецпредложение"
        : "⭐ Спецпредложение удалено",
      message: isAdded
        ? `В ЖК "${complex.name}" добавлено спецпредложение: "${offer}"`
        : `Из ЖК "${complex.name}" удалено спецпредложение: "${offer}"`,
      metadata: {
        complexId: complex.id,
        complexName: complex.name,
        entityId: complex.id,
        entityName: complex.name,
        newValue: isAdded ? offer : undefined,
        oldValue: !isAdded ? offer : undefined,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
    });
  }

  async notifyOfferCreated(
    offer: {
      id: string;
      companyId?: string | null;
      bankName?: string;
      programName?: string;
      rate?: number;
    },
    user: { id: string; firstName?: string; lastName?: string },
  ): Promise<void> {
    if (!offer.companyId) return;

    await this.notify(offer.companyId, {
      type: "offer_created",
      title: "📋 Новое ипотечное предложение",
      message: `Добавлено предложение от "${offer.bankName || "банка"}" по программе "${offer.programName || ""}"${offer.rate ? ` со ставкой ${offer.rate}%` : ""}`,
      metadata: {
        offerId: offer.id,
        entityId: offer.id,
        entityName: offer.programName || offer.bankName,
        bankName: offer.bankName,
        programName: offer.programName,
        newValue: offer.rate,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
      isImportant: true,
    });
  }

  async notifyOfferChanges(
    offer: {
      id: string;
      companyId?: string | null;
      bankName?: string;
      programName?: string;
    },
    changes: string[],
    user: { id: string; firstName?: string; lastName?: string },
  ): Promise<void> {
    if (!offer.companyId || changes.length === 0) return;

    const title =
      changes.length > 1
        ? `📝 Изменения в предложении от "${offer.bankName || "банка"}"`
        : `📝 Обновление предложения от "${offer.bankName || "банка"}"`;

    const message =
      changes.length > 1
        ? `Изменены: ${changes.join(", ")}`
        : `Изменен параметр: ${changes[0]}`;

    await this.notify(offer.companyId, {
      type: "offer_updated",
      title,
      message,
      metadata: {
        offerId: offer.id,
        entityId: offer.id,
        entityName: offer.programName || offer.bankName,
        bankName: offer.bankName,
        programName: offer.programName,
        changes,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
      isImportant: changes.length > 1,
    });
  }

  async notifyOfferDeleted(
    offer: {
      id: string;
      companyId?: string | null;
      bankName?: string;
    },
    user: { id: string; firstName?: string; lastName?: string },
  ): Promise<void> {
    if (!offer.companyId) return;

    await this.notify(offer.companyId, {
      type: "offer_deleted",
      title: "🗑️ Удаление ипотечного предложения",
      message: `Удалено предложение от "${offer.bankName || "банка"}"`,
      metadata: {
        offerId: offer.id,
        entityId: offer.id,
        bankName: offer.bankName,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
      isImportant: true,
    });
  }

  /**
   * Удалить ВСЕ уведомления пользователя
   */
  async deleteAll(userId: string): Promise<void> {
    await this.notificationRepository.delete({
      userId,
    });
  }

  // ============================================================
  // 🔥 ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
  // ============================================================

  /**
   * Создать одно уведомление
   */
  private async createNotification(data: {
    type: NotificationType;
    title: string;
    message: string;
    userId: string;
    companyId: string;
    metadata?: NotificationMetadata;
    isImportant?: boolean;
  }): Promise<Notification> {
    const notification = this.notificationRepository.create({
      type: data.type,
      title: data.title,
      message: data.message,
      userId: data.userId,
      companyId: data.companyId,
      metadata: data.metadata || {},
      isImportant: data.isImportant || false,
      isRead: false,
    });

    const saved = await this.notificationRepository.save(notification);

    return saved;
  }

  /**
   * Уведомить всех пользователей компании + администраторов системы
   *
   * Пользователи компании получают стандартное уведомление.
   * Администраторы системы получают уведомление с префиксом [Название компании].
   */
  private async notifyCompanyUsers(
    companyId: string,
    data: {
      type: NotificationType;
      title: string;
      message: string;
      metadata?: NotificationMetadata;
      isImportant?: boolean;
    },
  ): Promise<void> {
    // 🔥 1. Пользователи компании
    const companyUsers = await this.userRepository.find({
      where: { companyId },
    });

    // 🔥 2. Администраторы системы (role = "admin")
    const systemAdmins = await this.userRepository.find({
      where: { role: "admin" },
    });

    // 🔥 3. Исключаем админов, которые уже входят в компанию (чтобы не дублировать)
    const companyUserIds = new Set(companyUsers.map((u) => u.id));
    const adminsNotInCompany = systemAdmins.filter(
      (admin) => !companyUserIds.has(admin.id),
    );

    // 🔥 4. Загружаем название компании для префикса
    let companyName = "Компания";
    if (adminsNotInCompany.length > 0) {
      const company = await this.companyRepository.findOne({
        where: { id: companyId },
      });
      if (company) {
        companyName = company.name;
      }
    }

    // 🔥 5. Создаём уведомления для пользователей компании (стандартный текст)
    for (const user of companyUsers) {
      await this.createNotification({
        ...data,
        userId: user.id,
        companyId,
      });
    }

    // 🔥 6. Создаём уведомления для админов системы (с префиксом компании)
    for (const admin of adminsNotInCompany) {
      await this.createNotification({
        ...data,
        title: `[${companyName}] ${data.title}`,
        message: data.message,
        userId: admin.id,
        companyId,
        metadata: {
          ...data.metadata,
          isAdminNotification: true,
          companyName,
          companyId,
        },
      });
    }
  }

  // ============================================================
  // 🔥 МЕТОДЫ ДЛЯ ЧТЕНИЯ
  // ============================================================

  async getUserNotifications(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    },
  ): Promise<{ notifications: Notification[]; total: number }> {
    const query = this.notificationRepository
      .createQueryBuilder("notification")
      .where("notification.userId = :userId", { userId });

    if (options?.unreadOnly) {
      query.andWhere("notification.isRead = :isRead", { isRead: false });
    }

    const [notifications, total] = await query
      .orderBy("notification.createdAt", "DESC")
      .skip(options?.offset || 0)
      .take(options?.limit || 20)
      .getManyAndCount();

    return { notifications, total };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId, userId },
      { isRead: true },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<void> {
    await this.notificationRepository.delete({
      id: notificationId,
      userId,
    });
  }

  async deleteAllRead(userId: string): Promise<void> {
    await this.notificationRepository.delete({
      userId,
      isRead: true,
    });
  }

  async cleanOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.notificationRepository.delete({
      createdAt: LessThan(cutoffDate),
      isRead: true,
    });

    return result.affected || 0;
  }

  async getStats(companyId: string): Promise<{
    total: number;
    unread: number;
    important: number;
    byType: { type: string; count: number }[];
  }> {
    const total = await this.notificationRepository.count({
      where: { companyId },
    });

    const unread = await this.notificationRepository.count({
      where: { companyId, isRead: false },
    });

    const important = await this.notificationRepository.count({
      where: { companyId, isImportant: true },
    });

    const byType = await this.notificationRepository
      .createQueryBuilder("notification")
      .select("notification.type", "type")
      .addSelect("COUNT(*)", "count")
      .where("notification.companyId = :companyId", { companyId })
      .groupBy("notification.type")
      .getRawMany();

    return {
      total,
      unread,
      important,
      byType: byType.map((item) => ({
        type: item.type,
        count: parseInt(item.count, 10),
      })),
    };
  }
}
