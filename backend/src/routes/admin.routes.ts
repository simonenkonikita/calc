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
} from "../middleware/auth.middleware";
import { companyController } from "../controllers/admin/company.controller";

const router = Router();

// ============================================================
// 🔥 КОМПАНИИ (только для администратора проекта)
// ============================================================
router.get(
  "/companies",
  authMiddleware,
  adminOnly,
  companyController.getAll.bind(companyController),
);
router.get(
  "/companies/:id",
  authMiddleware,
  adminOnly,
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
// 🔥 БАНКИ (только для админов)
// ============================================================
router.get(
  "/banks",
  authMiddleware,
  bankController.getAll.bind(bankController),
);
router.get(
  "/banks/:id",
  authMiddleware,
  bankController.getOne.bind(bankController),
);
router.post(
  "/banks",
  authMiddleware,
  checkWriteAccess,
  bankController.create.bind(bankController),
);
router.put(
  "/banks/:id",
  authMiddleware,
  checkWriteAccess,
  bankController.update.bind(bankController),
);
router.delete(
  "/banks/:id",
  authMiddleware,
  checkWriteAccess,
  bankController.delete.bind(bankController),
);

// ============================================================
// 🔥 ЖК (КОМПЛЕКСЫ)
// ============================================================
router.get(
  "/complexes",
  authMiddleware,
  complexController.getAll.bind(complexController),
);
router.get(
  "/complexes/:id",
  authMiddleware,
  complexController.getOne.bind(complexController),
);
router.post(
  "/complexes",
  authMiddleware,
  checkWriteAccess,
  complexController.create.bind(complexController),
);
router.put(
  "/complexes/:id",
  authMiddleware,
  checkWriteAccess,
  complexController.update.bind(complexController),
);
router.delete(
  "/complexes/:id",
  authMiddleware,
  checkWriteAccess,
  complexController.delete.bind(complexController),
);

// ============================================================
// 🔥 ТИПЫ КВАРТИР
// ============================================================
router.get(
  "/complexes/:complexId/apartment-types",
  authMiddleware,
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
// 🔥 ПРОГРАММЫ (только для админов)
// ============================================================
router.get(
  "/programs",
  authMiddleware,
  programController.getAll.bind(programController),
);
router.post(
  "/programs",
  authMiddleware,
  checkWriteAccess,
  programController.create.bind(programController),
);
router.put(
  "/programs/:id",
  authMiddleware,
  checkWriteAccess,
  programController.update.bind(programController),
);
router.delete(
  "/programs/:id",
  authMiddleware,
  checkWriteAccess,
  programController.delete.bind(programController),
);

// ============================================================
// 🔥 ОФФЕРЫ
// ============================================================
router.get(
  "/offers",
  authMiddleware,
  offerController.getAll.bind(offerController),
);
router.get(
  "/offers/active",
  authMiddleware,
  offerController.getActive.bind(offerController),
);
router.get(
  "/offers/filter",
  authMiddleware,
  offerController.getFiltered.bind(offerController),
);
router.get(
  "/offers/rate-range",
  authMiddleware,
  offerController.getRateRange.bind(offerController),
);
router.get(
  "/offers/:id",
  authMiddleware,
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
  offerController.restore.bind(offerController),
);
router.delete(
  "/offers/:id/hard",
  authMiddleware,
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
  rateController.getAll.bind(rateController),
);
router.get(
  "/dynamic-rates/:id",
  authMiddleware,
  rateController.getOne.bind(rateController),
);
router.get(
  "/offers/:offerId/dynamic-rates",
  authMiddleware,
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
  checkWriteAccess,
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
  subsidyController.getAll.bind(subsidyController),
);
router.get(
  "/dynamic-subsidies/:id",
  authMiddleware,
  subsidyController.getOne.bind(subsidyController),
);
router.get(
  "/offers/:offerId/dynamic-subsidies",
  authMiddleware,
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
  checkWriteAccess,
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
// 🔥 КОНФИГУРАЦИЯ (только для админов)
// ============================================================
router.get(
  "/config",
  authMiddleware,
  configController.get.bind(configController),
);
router.get(
  "/config/check",
  authMiddleware,
  configController.check.bind(configController),
);
router.post(
  "/config",
  authMiddleware,
  checkWriteAccess,
  configController.create.bind(configController),
);
router.put(
  "/config",
  authMiddleware,
  checkWriteAccess,
  configController.update.bind(configController),
);
router.patch(
  "/config/:field",
  authMiddleware,
  checkWriteAccess,
  configController.updateField.bind(configController),
);

export default router;
