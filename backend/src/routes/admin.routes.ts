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
  adminOrDeveloperAdmin, // 🔥 ИЗМЕНЕНО
  bankController.getAll.bind(bankController),
);
router.get(
  "/banks/:id",
  authMiddleware,
  adminOrDeveloperAdmin, // 🔥 ИЗМЕНЕНО
  bankController.getOne.bind(bankController),
);
router.post(
  "/banks",
  authMiddleware,
  adminOnly, // 🔥 ТОЛЬКО АДМИН
  bankController.create.bind(bankController),
);
router.put(
  "/banks/:id",
  authMiddleware,
  adminOnly, // 🔥 ТОЛЬКО АДМИН
  bankController.update.bind(bankController),
);
router.delete(
  "/banks/:id",
  authMiddleware,
  adminOnly, // 🔥 ТОЛЬКО АДМИН
  bankController.delete.bind(bankController),
);

// ============================================================
// 🔥 ЖК - ДОСТУП ДЛЯ АДМИНА И ЗАСТРОЙЩИКА (С ФИЛЬТРАЦИЕЙ)
// ============================================================
router.get(
  "/complexes",
  authMiddleware,
  adminOrDeveloperAdmin, // 🔥 ИЗМЕНЕНО
  complexController.getAll.bind(complexController),
);
router.get(
  "/complexes/:id",
  authMiddleware,
  adminOrDeveloperAdmin, // 🔥 ИЗМЕНЕНО
  complexController.getOne.bind(complexController),
);
router.post(
  "/complexes",
  authMiddleware,
  checkWriteAccess, // developer_admin может создавать ЖК
  complexController.create.bind(complexController),
);
router.put(
  "/complexes/:id",
  authMiddleware,
  checkWriteAccess, // developer_admin может редактировать ЖК
  complexController.update.bind(complexController),
);
router.delete(
  "/complexes/:id",
  authMiddleware,
  checkWriteAccess, // developer_admin может удалять ЖК
  complexController.delete.bind(complexController),
);

// ============================================================
// 🔥 ТИПЫ КВАРТИР - ДОСТУП ДЛЯ АДМИНА И ЗАСТРОЙЩИКА
// ============================================================
router.get(
  "/complexes/:complexId/apartment-types",
  authMiddleware,
  adminOrDeveloperAdmin, // 🔥 ИЗМЕНЕНО
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
  adminOrDeveloperAdmin, // 🔥 ИЗМЕНЕНО - застройщик может видеть программы
  programController.getAll.bind(programController),
);
router.post(
  "/programs",
  authMiddleware,
  adminOnly, // 🔥 ТОЛЬКО АДМИН
  programController.create.bind(programController),
);
router.put(
  "/programs/:id",
  authMiddleware,
  adminOnly, // 🔥 ТОЛЬКО АДМИН
  programController.update.bind(programController),
);
router.delete(
  "/programs/:id",
  authMiddleware,
  adminOnly, // 🔥 ТОЛЬКО АДМИН
  programController.delete.bind(programController),
);

// ============================================================
// 🔥 ОФФЕРЫ - ДОСТУП ДЛЯ АДМИНА И ЗАСТРОЙЩИКА
// ============================================================
router.get(
  "/offers",
  authMiddleware,
  adminOrDeveloperAdmin, // 🔥 ИЗМЕНЕНО
  offerController.getAll.bind(offerController),
);
router.get(
  "/offers/active",
  authMiddleware,
  adminOrDeveloperAdmin, // 🔥 ИЗМЕНЕНО
  offerController.getActive.bind(offerController),
);
router.get(
  "/offers/filter",
  authMiddleware,
  adminOrDeveloperAdmin, // 🔥 ИЗМЕНЕНО
  offerController.getFiltered.bind(offerController),
);
router.get(
  "/offers/rate-range",
  authMiddleware,
  adminOrDeveloperAdmin, // 🔥 ИЗМЕНЕНО
  offerController.getRateRange.bind(offerController),
);
router.get(
  "/offers/:id",
  authMiddleware,
  adminOrDeveloperAdmin, // 🔥 ИЗМЕНЕНО
  offerController.getOne.bind(offerController),
);
router.post(
  "/offers",
  authMiddleware,
  checkWriteAccess,
  offerController.create.bind(offerController),
);
router.put(
  "/offers/:id",
  authMiddleware,
  checkWriteAccess,
  offerController.update.bind(offerController),
);
router.delete(
  "/offers/:id",
  authMiddleware,
  checkWriteAccess,
  offerController.delete.bind(offerController),
);
router.post(
  "/offers/:id/restore",
  authMiddleware,
  adminOnly, // 🔥 ТОЛЬКО АДМИН
  offerController.restore.bind(offerController),
);
router.delete(
  "/offers/:id/hard",
  authMiddleware,
  adminOnly, // 🔥 ТОЛЬКО АДМИН
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
  adminOrDeveloperAdmin, // 🔥 ИЗМЕНЕНО
  rateController.getAll.bind(rateController),
);
router.get(
  "/dynamic-rates/:id",
  authMiddleware,
  adminOrDeveloperAdmin, // 🔥 ИЗМЕНЕНО
  rateController.getOne.bind(rateController),
);
router.get(
  "/offers/:offerId/dynamic-rates",
  authMiddleware,
  adminOrDeveloperAdmin, // 🔥 ИЗМЕНЕНО
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
  adminOnly, // 🔥 ТОЛЬКО АДМИН
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
  adminOrDeveloperAdmin, // 🔥 ИЗМЕНЕНО
  subsidyController.getAll.bind(subsidyController),
);
router.get(
  "/dynamic-subsidies/:id",
  authMiddleware,
  adminOrDeveloperAdmin, // 🔥 ИЗМЕНЕНО
  subsidyController.getOne.bind(subsidyController),
);
router.get(
  "/offers/:offerId/dynamic-subsidies",
  authMiddleware,
  adminOrDeveloperAdmin, // 🔥 ИЗМЕНЕНО
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
  adminOnly, // 🔥 ТОЛЬКО АДМИН
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
// 🔥 КОНФИГУРАЦИЯ - ТОЛЬКО ДЛЯ АДМИНА
// ============================================================
router.get(
  "/config",
  authMiddleware,
  adminOnly, // 🔥 ТОЛЬКО АДМИН
  configController.get.bind(configController),
);
router.get(
  "/config/check",
  authMiddleware,
  adminOnly, // 🔥 ТОЛЬКО АДМИН
  configController.check.bind(configController),
);
router.post(
  "/config",
  authMiddleware,
  adminOnly, // 🔥 ТОЛЬКО АДМИН
  configController.create.bind(configController),
);
router.put(
  "/config",
  authMiddleware,
  adminOnly, // 🔥 ТОЛЬКО АДМИН
  configController.update.bind(configController),
);
router.patch(
  "/config/:field",
  authMiddleware,
  adminOnly, // 🔥 ТОЛЬКО АДМИН
  configController.updateField.bind(configController),
);

export default router;
