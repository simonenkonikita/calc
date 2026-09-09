// backend/src/services/NotificationService.ts

import { AppDataSource } from "../data-source";
import { Notification, NotificationType } from "../entities/Notification";
import { User } from "../entities/User";
import { In } from "typeorm";

export class NotificationService {
  private notificationRepository = AppDataSource.getRepository(Notification);
  private userRepository = AppDataSource.getRepository(User);

  // ============================================================
  // ОСНОВНОЙ МЕТОД ДЛЯ УВЕДОМЛЕНИЙ
  // ============================================================

  async notify(
    companyId: string | null | undefined,
    data: {
      type: NotificationType;
      title: string;
      message: string;
      metadata?: any;
      isImportant?: boolean;
      userId?: string;
    },
  ): Promise<void> {
    if (!companyId) return;

    // Если указан конкретный пользователь - уведомляем только его
    if (data.userId) {
      await this.createNotification({
        ...data,
        userId: data.userId,
        companyId,
      });
      return;
    }

    // Иначе уведомляем всех пользователей компании
    await this.notifyCompanyUsers(companyId, data);
  }

  // ============================================================
  // УВЕДОМЛЕНИЕ ОБ ИЗМЕНЕНИЯХ В ЖК
  // ============================================================

  async notifyComplexChanges(
    complex: { id: string; name: string; companyId?: string | null },
    changes: string[],
    user: { id: string; firstName?: string; lastName?: string },
    metadata?: any,
  ): Promise<void> {
    if (!complex.companyId || changes.length === 0) return;

    const title =
      changes.length > 1
        ? `📝 Изменения в ЖК "${complex.name}"`
        : `📝 Обновление ЖК "${complex.name}"`;

    const message =
      changes.length > 1
        ? `Изменены параметры: ${changes.join(", ")}`
        : `Изменен параметр: ${changes[0]}`;

    await this.notify(complex.companyId, {
      type: "complex_updated",
      title,
      message,
      metadata: {
        complexId: complex.id,
        complexName: complex.name,
        changes,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        ...metadata,
      },
      isImportant: changes.length > 1,
    });
  }

  // ============================================================
  // УВЕДОМЛЕНИЕ О ДОБАВЛЕНИИ/УДАЛЕНИИ БАНКА
  // ============================================================

  async notifyBankChange(
    complex: { id: string; name: string; companyId?: string | null },
    bankName: string,
    action: "added" | "removed",
    user: { id: string; firstName?: string; lastName?: string },
  ): Promise<void> {
    if (!complex.companyId) return;

    const isAdded = action === "added";
    await this.notify(complex.companyId, {
      type: isAdded ? "bank_added" : "bank_removed",
      title: isAdded ? "🏦 Новый банк-партнер в ЖК" : "🏦 Банк удален из ЖК",
      message: isAdded
        ? `В ЖК "${complex.name}" добавлен банк "${bankName}"`
        : `Из ЖК "${complex.name}" удален банк "${bankName}"`,
      metadata: {
        complexId: complex.id,
        complexName: complex.name,
        bankName,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
      isImportant: true,
    });
  }

  // ============================================================
  // УВЕДОМЛЕНИЕ О ДОБАВЛЕНИИ/УДАЛЕНИИ БАНКА (ГЛОБАЛЬНОЕ)
  // ============================================================

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
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
      isImportant: true,
    });
  }

  // ============================================================
  // УВЕДОМЛЕНИЕ ОБ ОБНОВЛЕНИИ БАНКА
  // ============================================================

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
        changes,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
      isImportant: changes.length > 1,
    });
  }
  // ============================================================
  // УВЕДОМЛЕНИЕ О ДОБАВЛЕНИИ/УДАЛЕНИИ УСЛОВИЯ ОПЛАТЫ
  // ============================================================

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
        term,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
    });
  }

  // ============================================================
  // УВЕДОМЛЕНИЕ О ДОБАВЛЕНИИ/УДАЛЕНИИ АКЦИИ
  // ============================================================

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
        promotion,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
    });
  }

  // ============================================================
  // УВЕДОМЛЕНИЕ О ДОБАВЛЕНИИ/УДАЛЕНИИ СПЕЦПРЕДЛОЖЕНИЯ
  // ============================================================

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
        offer,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
    });
  }

  // ============================================================
  // УВЕДОМЛЕНИЕ О СОЗДАНИИ ЖК
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
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
      isImportant: true,
    });
  }

  // ============================================================
  // УВЕДОМЛЕНИЕ ОБ ИЗМЕНЕНИЯХ В ОФФЕРЕ
  // ============================================================

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
        ? `Изменены параметры: ${changes.join(", ")}`
        : `Изменен параметр: ${changes[0]}`;

    await this.notify(offer.companyId, {
      type: "offer_updated",
      title,
      message,
      metadata: {
        offerId: offer.id,
        bankName: offer.bankName,
        programName: offer.programName,
        changes,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
      isImportant: changes.length > 1,
    });
  }

  // ============================================================
  // УВЕДОМЛЕНИЕ О СОЗДАНИИ ОФФЕРА
  // ============================================================

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
        bankName: offer.bankName,
        programName: offer.programName,
        rate: offer.rate,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
      isImportant: true,
    });
  }

  // ============================================================
  // УВЕДОМЛЕНИЕ ОБ УДАЛЕНИИ ОФФЕРА
  // ============================================================

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
        bankName: offer.bankName,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
      isImportant: true,
    });
  }

  // ============================================================
  // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
  // ============================================================

  private async createNotification(data: {
    type: NotificationType;
    title: string;
    message: string;
    userId: string;
    companyId: string;
    metadata?: any;
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

    return this.notificationRepository.save(notification);
  }

  private async notifyCompanyUsers(
    companyId: string,
    data: {
      type: NotificationType;
      title: string;
      message: string;
      metadata?: any;
      isImportant?: boolean;
    },
  ): Promise<void> {
    const users = await this.userRepository.find({
      where: { companyId },
    });

    if (users.length === 0) return;

    for (const user of users) {
      await this.createNotification({
        ...data,
        userId: user.id,
        companyId,
      });
    }
  }

  // ============================================================
  // МЕТОДЫ ДЛЯ ПОЛУЧЕНИЯ УВЕДОМЛЕНИЙ
  // ============================================================

  async getUserNotifications(
    userId: string,
    options?: { limit?: number; offset?: number; unreadOnly?: boolean },
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
}
