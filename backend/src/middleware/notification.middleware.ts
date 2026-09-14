// backend/src/middleware/notification.middleware.ts

import { Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { AuthRequest } from "../types/auth.types";
import { NotificationService } from "../services/NotificationService";

const notificationService = new NotificationService();

// ============================================================
// КОНФИГУРАЦИЯ ДЛЯ ОТСЛЕЖИВАНИЯ СУЩНОСТЕЙ
// ============================================================

interface FieldConfig {
  field: string;
  label: string;
  format?: (value: any) => string;
}

interface EntityConfig {
  entityName: string;
  repository: any;
  fields: FieldConfig[];
  getCompanyId: (entity: any) => string | null;
  getName: (entity: any) => string;
  onCreate?: {
    type: any;
    title: string;
    message: (entity: any) => string;
  };
  onDelete?: {
    type: any;
    title: string;
    message: (entity: any) => string;
  };
  onUpdate?: {
    type: any;
    title: (changesCount: number, name: string) => string;
  };
}

// ============================================================
// РЕГИСТРАЦИЯ СУЩНОСТЕЙ ДЛЯ ОТСЛЕЖИВАНИЯ
// ============================================================

const entityConfigs: Record<string, EntityConfig> = {
  complex: {
    entityName: "complex",
    repository: () => AppDataSource.getRepository("Complex"),
    fields: [
      { field: "name", label: "название" },
      { field: "status", label: "статус" },
      { field: "description", label: "описание" },
      { field: "banks", label: "список банков" },
      { field: "paymentTerms", label: "условия оплаты" },
      { field: "promotions", label: "акции" },
      { field: "specialOffers", label: "спецпредложения" },
      {
        field: "isActive",
        label: "активность",
        format: (v) => (v ? "активирован" : "деактивирован"),
      },
    ],
    getCompanyId: (entity) => entity.companyId,
    getName: (entity) => entity.name,
    onCreate: {
      type: "complex_created",
      title: "🏗️ Новый жилой комплекс",
      message: (entity) => `Добавлен новый ЖК "${entity.name}"`,
    },
    onDelete: {
      type: "complex_deleted",
      title: "🗑️ Жилой комплекс удален",
      message: (entity) => `ЖК "${entity.name}" был удален`,
    },
    onUpdate: {
      type: "complex_updated",
      title: (count, name) =>
        count > 1
          ? `📝 Изменения в ЖК "${name}"`
          : `📝 Обновление ЖК "${name}"`,
    },
  },

  bank: {
    entityName: "bank",
    repository: () => AppDataSource.getRepository("Bank"),
    fields: [
      { field: "name", label: "название" },
      { field: "baseRate", label: "базовая ставка", format: (v) => `${v}%` },
      { field: "minPVPercent", label: "мин. ПВ", format: (v) => `${v}%` },
      {
        field: "isActive",
        label: "активность",
        format: (v) => (v ? "активирован" : "деактивирован"),
      },
    ],
    getCompanyId: () => null,
    getName: (entity) => entity.name,
    onCreate: {
      type: "bank_added",
      title: "🏦 Новый банк-партнер",
      message: (entity) => `Добавлен новый банк "${entity.name}"`,
    },
    onDelete: {
      type: "bank_removed",
      title: "🏦 Банк больше не партнер",
      message: (entity) =>
        `Банк "${entity.name}" больше не является партнером`,
    },
    onUpdate: {
      type: "bank_updated",
      title: (count, name) => `📝 Обновление банка "${name}"`,
    },
  },

  offer: {
    entityName: "offer",
    repository: () => AppDataSource.getRepository("Offer"),
    fields: [
      { field: "rate", label: "ставка", format: (v) => `${v}%` },
      { field: "subsidyPercent", label: "субсидия", format: (v) => `${v}%` },
      { field: "minPVPercent", label: "мин. ПВ", format: (v) => `${v}%` },
      {
        field: "shortRate",
        label: "короткая ставка",
        format: (v) => (v ? `${v}%` : "—"),
      },
      {
        field: "twoRate",
        label: "ставка по 2-м договорам",
        format: (v) => (v ? `${v}%` : "—"),
      },
      {
        field: "isActive",
        label: "активность",
        format: (v) => (v ? "активирован" : "деактивирован"),
      },
      {
        field: "isTwoContracts",
        label: "два договора",
        format: (v) => (v ? "включено" : "выключено"),
      },
      {
        field: "isExcessLimit",
        label: "превышение лимита",
        format: (v) => (v ? "включено" : "выключено"),
      },
      {
        field: "isTranche",
        label: "траншевый",
        format: (v) => (v ? "включено" : "выключено"),
      },
    ],
    getCompanyId: (entity) => entity.companyId,
    getName: (entity) => entity.program || entity.bank?.name || "оффер",
    onCreate: {
      type: "offer_created",
      title: "📋 Новое ипотечное предложение",
      message: (entity) =>
        `Добавлено предложение от "${entity.bank?.name || "банка"}" со ставкой ${entity.rate}%`,
    },
    onDelete: {
      type: "offer_deleted",
      title: "🗑️ Удаление ипотечного предложения",
      message: (entity) =>
        `Удалено предложение от "${entity.bank?.name || "банка"}"`,
    },
    onUpdate: {
      type: "offer_updated",
      title: (count, name) =>
        count > 1
          ? `📝 Изменения в предложении от "${name}"`
          : `📝 Обновление предложения от "${name}"`,
    },
  },
};

// ============================================================
// УТИЛИТЫ ДЛЯ СРАВНЕНИЯ
// ============================================================

function detectChanges(
  oldEntity: any,
  newData: any,
  config: EntityConfig,
): string[] {
  const changes: string[] = [];

  for (const fieldConfig of config.fields) {
    const { field, label, format } = fieldConfig;
    const oldValue = oldEntity[field];
    const newValue = newData[field];

    if (newValue === undefined) continue;

    const oldStr = JSON.stringify(oldValue);
    const newStr = JSON.stringify(newValue);

    if (oldStr !== newStr) {
      if (format) {
        changes.push(`${label}: ${format(newValue)}`);
      } else if (typeof oldValue === "string" && typeof newValue === "string") {
        changes.push(`${label} с "${oldValue}" на "${newValue}"`);
      } else {
        changes.push(label);
      }
    }
  }

  return changes;
}

// ============================================================
// MIDDLEWARE
// ============================================================

export const notificationMiddleware = (
  entityType: keyof typeof entityConfigs,
  action: "create" | "update" | "delete",
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const config = entityConfigs[entityType];
    if (!config) return next();

    const user = req.user;
    if (!user) return next();

    const { id } = req.params;

    // Сохраняем тело запроса
    const requestBody = { ...req.body };

    // Сохраняем оригинальный json метод
    const originalJson = res.json.bind(res);

    // Для update и delete — загружаем старую сущность
    let oldEntity: any = null;
    if (action === "update" || action === "delete") {
      const repository = config.repository();
      oldEntity = await repository.findOne({
        where: { id },
        relations:
          entityType === "offer" ? ["bank", "programEntity"] : ["company"],
      });
    }

    // Перехватываем ответ
    res.json = function (body: any) {
      // Восстанавливаем оригинальный метод
      res.json = originalJson;

      // Отправляем ответ клиенту
      const result = originalJson(body);

      // Асинхронно создаём уведомления (не блокируем ответ)
      setImmediate(async () => {
        try {
          await handleNotification(
            action,
            config,
            oldEntity,
            body,
            user,
            requestBody,
            id,
          );
        } catch (error) {
          console.error("❌ Notification error:", error);
        }
      });

      return result;
    };

    next();
  };
};

// ============================================================
// ОБРАБОТЧИК УВЕДОМЛЕНИЙ
// ============================================================

async function handleNotification(
  action: "create" | "update" | "delete",
  config: EntityConfig,
  oldEntity: any,
  responseBody: any,
  user: { id: string; firstName?: string; lastName?: string },
  requestBody: any,
  entityId?: string,
) {
  const userData = {
    id: user.id || "system",
    firstName: user.firstName || "Система",
    lastName: user.lastName || "",
  };

  // Данные из ответа (новые)
  const newEntity = responseBody?.data;

  // ============================================================
  // СОЗДАНИЕ
  // ============================================================
  if (action === "create" && config.onCreate && newEntity) {
    const companyId = config.getCompanyId(newEntity);
    if (!companyId) return;

    await notificationService.notify(companyId, {
      type: config.onCreate.type,
      title: config.onCreate.title,
      message: config.onCreate.message(newEntity),
      metadata: {
        entityId: newEntity.id,
        entityName: config.getName(newEntity),
        userId: userData.id,
        userName: `${userData.firstName} ${userData.lastName}`.trim(),
      },
      isImportant: true,
    });
    return;
  }

  // ============================================================
  // УДАЛЕНИЕ
  // ============================================================
  if (action === "delete" && config.onDelete && oldEntity) {
    const companyId = config.getCompanyId(oldEntity);
    if (!companyId) return;

    await notificationService.notify(companyId, {
      type: config.onDelete.type,
      title: config.onDelete.title,
      message: config.onDelete.message(oldEntity),
      metadata: {
        entityId: oldEntity.id,
        entityName: config.getName(oldEntity),
        userId: userData.id,
        userName: `${userData.firstName} ${userData.lastName}`.trim(),
      },
      isImportant: true,
    });
    return;
  }

  // ============================================================
  // ОБНОВЛЕНИЕ
  // ============================================================
  if (action === "update" && config.onUpdate && oldEntity && newEntity) {
    const companyId =
      config.getCompanyId(newEntity) || config.getCompanyId(oldEntity);
    if (!companyId) return;

    const changes = detectChanges(oldEntity, requestBody, config);
    if (changes.length === 0) return;

    const entityName = config.getName(newEntity);

    await notificationService.notify(companyId, {
      type: config.onUpdate.type,
      title: config.onUpdate.title(changes.length, entityName),
      message:
        changes.length > 1
          ? `Изменены: ${changes.join(", ")}`
          : `Изменен параметр: ${changes[0]}`,
      metadata: {
        entityId: newEntity.id || oldEntity.id,
        entityName,
        changes,
        userId: userData.id,
        userName: `${userData.firstName} ${userData.lastName}`.trim(),
      },
      isImportant: changes.length > 1,
    });
  }
}