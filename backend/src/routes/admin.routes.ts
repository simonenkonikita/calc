// backend/src/routes/admin.routes.ts

import { Router } from "express";
import {
  bankController,
  complexController,
  apartmentTypeController,
  programController,
  offerController,
  rateController,
  subsidyController,
  configController,
} from "../controllers/admin";

import {
  authMiddleware,
  checkWriteAccess,
  checkCompanyAccess,
  adminOnly,
  adminOrDeveloperAdmin,
} from "../middleware/auth.middleware";
import { companyController } from "../controllers/admin/company.controller";
import { notificationMiddleware } from "../middleware/notification.middleware"; // 🔥 ДОБАВЛЯЕМ

const router = Router();

// ============================================================
// 🔥 КОМПАНИИ - ТОЛЬКО ДЛЯ АДМИНИСТРАТОРА ПРОЕКТА
// ============================================================
router.get(
  "/companies",
  authMiddleware,
  adminOrDeveloperAdmin,
  companyController.getAll.bind(companyController),
);
router.get(
  "/companies/:id",
  authMiddleware,
  adminOrDeveloperAdmin,
  companyController.getOne.bind(companyController),
);
router.post(
  "/companies",
  authMiddleware,
  adminOnly,
  companyController.create.bind(companyController),
);
router.put(
  "/companies/:id",
  authMiddleware,
  adminOnly,
  companyController.update.bind(companyController),
);
router.delete(
  "/companies/:id",
  authMiddleware,
  adminOnly,
  companyController.delete.bind(companyController),
);

// ============================================================
// 🔥 БАНКИ - ЧТЕНИЕ ДЛЯ ВСЕХ, ЗАПИСЬ ТОЛЬКО ДЛЯ АДМИНА
// ============================================================
router.get(
  "/banks",
  authMiddleware,
  adminOrDeveloperAdmin,
  bankController.getAll.bind(bankController),
);
router.get(
  "/banks/:id",
  authMiddleware,
  adminOrDeveloperAdmin,
  bankController.getOne.bind(bankController),
);
router.post(
  "/banks",
  authMiddleware,
  adminOnly,
  notificationMiddleware("bank", "create"), // 🔥 ДОБАВЛЯЕМ
  bankController.create.bind(bankController),
);
router.put(
  "/banks/:id",
  authMiddleware,
  adminOnly,
  notificationMiddleware("bank", "update"), // 🔥 ДОБАВЛЯЕМ
  bankController.update.bind(bankController),
);
router.delete(
  "/banks/:id",
  authMiddleware,
  adminOnly,
  notificationMiddleware("bank", "delete"), // 🔥 ДОБАВЛЯЕМ
  bankController.delete.bind(bankController),
);

// ============================================================
// 🔥 ЖК - ДОСТУП ДЛЯ АДМИНА И ЗАСТРОЙЩИКА (С ФИЛЬТРАЦИЕЙ)
// ============================================================
router.get(
  "/complexes",
  authMiddleware,
  adminOrDeveloperAdmin,
  complexController.getAll.bind(complexController),
);
router.get(
  "/complexes/:id",
  authMiddleware,
  adminOrDeveloperAdmin,
  complexController.getOne.bind(complexController),
);
router.post(
  "/complexes",
  authMiddleware,
  checkWriteAccess,
  notificationMiddleware("complex", "create"), // 🔥 ДОБАВЛЯЕМ
  complexController.create.bind(complexController),
);
router.put(
  "/complexes/:id",
  authMiddleware,
  checkWriteAccess,
  notificationMiddleware("complex", "update"), // 🔥 ДОБАВЛЯЕМ
  complexController.update.bind(complexController),
);
router.delete(
  "/complexes/:id",
  authMiddleware,
  checkWriteAccess,
  notificationMiddleware("complex", "delete"), // 🔥 ДОБАВЛЯЕМ
  complexController.delete.bind(complexController),
);

// ============================================================
// 🔥 ТИПЫ КВАРТИР - ДОСТУП ДЛЯ АДМИНА И ЗАСТРОЙЩИКА
// ============================================================
router.get(
  "/complexes/:complexId/apartment-types",
  authMiddleware,
  adminOrDeveloperAdmin,
  apartmentTypeController.getByComplex.bind(apartmentTypeController),
);
router.post(
  "/complexes/:complexId/apartment-types",
  authMiddleware,
  checkWriteAccess,
  apartmentTypeController.create.bind(apartmentTypeController),
);
router.put(
  "/apartment-types/:id",
  authMiddleware,
  checkWriteAccess,
  apartmentTypeController.update.bind(apartmentTypeController),
);
router.delete(
  "/apartment-types/:id",
  authMiddleware,
  checkWriteAccess,
  apartmentTypeController.delete.bind(apartmentTypeController),
);

// ============================================================
// 🔥 ПРОГРАММЫ - ЧТЕНИЕ ДЛЯ ВСЕХ, ЗАПИСЬ ТОЛЬКО ДЛЯ АДМИНА
// ============================================================
router.get(
  "/programs",
  authMiddleware,
  adminOrDeveloperAdmin,
  programController.getAll.bind(programController),
);
router.post(
  "/programs",
  authMiddleware,
  adminOnly,
  programController.create.bind(programController),
);
router.put(
  "/programs/:id",
  authMiddleware,
  adminOnly,
  programController.update.bind(programController),
);
router.delete(
  "/programs/:id",
  authMiddleware,
  adminOnly,
  programController.delete.bind(programController),
);

// ============================================================
// 🔥 ОФФЕРЫ - ДОСТУП ДЛЯ АДМИНА И ЗАСТРОЙЩИКА
// ============================================================
router.get(
  "/offers",
  authMiddleware,
  adminOrDeveloperAdmin,
  offerController.getAll.bind(offerController),
);
router.get(
  "/offers/active",
  authMiddleware,
  adminOrDeveloperAdmin,
  offerController.getActive.bind(offerController),
);
router.get(
  "/offers/filter",
  authMiddleware,
  adminOrDeveloperAdmin,
  offerController.getFiltered.bind(offerController),
);
router.get(
  "/offers/rate-range",
  authMiddleware,
  adminOrDeveloperAdmin,
  offerController.getRateRange.bind(offerController),
);
router.get(
  "/offers/:id",
  authMiddleware,
  adminOrDeveloperAdmin,
  offerController.getOne.bind(offerController),
);
router.post(
  "/offers",
  authMiddleware,
  checkWriteAccess,
  notificationMiddleware("offer", "create"), // 🔥 ДОБАВЛЯЕМ
  offerController.create.bind(offerController),
);
router.put(
  "/offers/:id",
  authMiddleware,
  checkWriteAccess,
  notificationMiddleware("offer", "update"), // 🔥 ДОБАВЛЯЕМ
  offerController.update.bind(offerController),
);
router.delete(
  "/offers/:id",
  authMiddleware,
  checkWriteAccess,
  notificationMiddleware("offer", "delete"), // 🔥 ДОБАВЛЯЕМ
  offerController.delete.bind(offerController),
);
router.post(
  "/offers/:id/restore",
  authMiddleware,
  adminOnly,
  offerController.restore.bind(offerController),
);
router.delete(
  "/offers/:id/hard",
  authMiddleware,
  adminOnly,
  offerController.hardDelete.bind(offerController),
);
router.post(
  "/offers/:id/copy",
  authMiddleware,
  checkWriteAccess,
  offerController.copy.bind(offerController),
);

// ============================================================
// 🔥 ДИНАМИЧЕСКИЕ СТАВКИ
// ============================================================
router.get(
  "/dynamic-rates",
  authMiddleware,
  adminOrDeveloperAdmin,
  rateController.getAll.bind(rateController),
);
router.get(
  "/dynamic-rates/:id",
  authMiddleware,
  adminOrDeveloperAdmin,
  rateController.getOne.bind(rateController),
);
router.get(
  "/offers/:offerId/dynamic-rates",
  authMiddleware,
  adminOrDeveloperAdmin,
  rateController.getByOffer.bind(rateController),
);
router.post(
  "/offers/:offerId/dynamic-rates",
  authMiddleware,
  checkWriteAccess,
  rateController.create.bind(rateController),
);
router.put(
  "/dynamic-rates/:id",
  authMiddleware,
  checkWriteAccess,
  rateController.update.bind(rateController),
);
router.delete(
  "/dynamic-rates/:id",
  authMiddleware,
  checkWriteAccess,
  rateController.delete.bind(rateController),
);
router.delete(
  "/dynamic-rates/:id/hard",
  authMiddleware,
  adminOnly,
  rateController.hardDelete.bind(rateController),
);
router.put(
  "/dynamic-rates/priorities",
  authMiddleware,
  checkWriteAccess,
  rateController.updatePriorities.bind(rateController),
);

// ============================================================
// 🔥 ДИНАМИЧЕСКИЕ СУБСИДИИ
// ============================================================
router.get(
  "/dynamic-subsidies",
  authMiddleware,
  adminOrDeveloperAdmin,
  subsidyController.getAll.bind(subsidyController),
);
router.get(
  "/dynamic-subsidies/:id",
  authMiddleware,
  adminOrDeveloperAdmin,
  subsidyController.getOne.bind(subsidyController),
);
router.get(
  "/offers/:offerId/dynamic-subsidies",
  authMiddleware,
  adminOrDeveloperAdmin,
  subsidyController.getByOffer.bind(subsidyController),
);
router.post(
  "/offers/:offerId/dynamic-subsidies",
  authMiddleware,
  checkWriteAccess,
  subsidyController.create.bind(subsidyController),
);
router.put(
  "/dynamic-subsidies/:id",
  authMiddleware,
  checkWriteAccess,
  subsidyController.update.bind(subsidyController),
);
router.delete(
  "/dynamic-subsidies/:id",
  authMiddleware,
  checkWriteAccess,
  subsidyController.delete.bind(subsidyController),
);
router.delete(
  "/dynamic-subsidies/:id/hard",
  authMiddleware,
  adminOnly,
  subsidyController.hardDelete.bind(subsidyController),
);
router.put(
  "/dynamic-subsidies/priorities",
  authMiddleware,
  checkWriteAccess,
  subsidyController.updatePriorities.bind(subsidyController),
);
router.post(
  "/dynamic-subsidies/copy",
  authMiddleware,
  checkWriteAccess,
  subsidyController.copyFromOffer.bind(subsidyController),
);

// ============================================================
// 🔥 УПРАВЛЕНИЕ УСЛОВИЯМИ ОПЛАТЫ
// ============================================================
router.post(
  "/complexes/:id/payment-terms", // 🔥 ИСПРАВЛЕН ПУТЬ (было /:id/payment-terms)
  authMiddleware,                   // 🔥 ДОБАВЛЕН
  adminOrDeveloperAdmin,
  complexController.addPaymentTerm.bind(complexController),
);

router.delete(
  "/complexes/:id/payment-terms", // 🔥 ИСПРАВЛЕН ПУТЬ
  authMiddleware,
  adminOrDeveloperAdmin,
  complexController.removePaymentTerm.bind(complexController),
);

router.put(
  "/complexes/:id/payment-terms", // 🔥 ИСПРАВЛЕН ПУТЬ
  authMiddleware,
  adminOrDeveloperAdmin,
  complexController.updatePaymentTerms.bind(complexController),
);

// ============================================================
// 🔥 КОНФИГУРАЦИЯ - ТОЛЬКО ДЛЯ АДМИНА
// ============================================================
router.get(
  "/config",
  authMiddleware,
  adminOnly,
  configController.get.bind(configController),
);
router.get(
  "/config/check",
  authMiddleware,
  adminOnly,
  configController.check.bind(configController),
);
router.post(
  "/config",
  authMiddleware,
  adminOnly,
  configController.create.bind(configController),
);
router.put(
  "/config",
  authMiddleware,
  adminOnly,
  configController.update.bind(configController),
);
router.patch(
  "/config/:field",
  authMiddleware,
  adminOnly,
  configController.updateField.bind(configController),
);

export default router;