// backend/src/routes/admin.routes.ts

import { Router } from "express";
import {
  // Банки
  getBanks,
  createBank,
  updateBank,
  deleteBank,
  // ЖК
  getComplexes,
  createComplex,
  updateComplex,
  deleteComplex,
  // Типы квартир
  getApartmentTypes,
  createApartmentType,
  updateApartmentType,
  deleteApartmentType,
  // Программы
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  // Офферы
  getOffers,
  getActiveOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  restoreOffer,
  hardDeleteOffer,
  copyOffer,
  getOffersFiltered,
  getRateRange,
  // Ставки
  getAllDynamicRates,
  getDynamicRatesByOffer,
  createDynamicRate,
  updateDynamicRate,
  deleteDynamicRate,
  // Субсидии
  getAllDynamicSubsidies,
  getDynamicSubsidiesByOffer,
  createDynamicSubsidy,
  updateDynamicSubsidy,
  deleteDynamicSubsidy,
  // Конфиг
  getConfig,
  updateConfig,
} from "../controllers/admin.controller";

const router = Router();

// ============================================================
// БАНКИ
// ============================================================
router.get("/banks", getBanks);
router.post("/banks", createBank);
router.put("/banks/:id", updateBank);
router.delete("/banks/:id", deleteBank);

// ============================================================
// ЖК (КОМПЛЕКСЫ)
// ============================================================
router.get("/complexes", getComplexes);
router.post("/complexes", createComplex);
router.put("/complexes/:id", updateComplex);
router.delete("/complexes/:id", deleteComplex);

// ============================================================
// ТИПЫ КВАРТИР
// ============================================================
router.get("/complexes/:complexId/apartment-types", getApartmentTypes);
router.post("/complexes/:complexId/apartment-types", createApartmentType);
router.put("/apartment-types/:id", updateApartmentType);
router.delete("/apartment-types/:id", deleteApartmentType);

// ============================================================
// ПРОГРАММЫ
// ============================================================
router.get("/programs", getPrograms);
router.post("/programs", createProgram);
router.put("/programs/:id", updateProgram);
router.delete("/programs/:id", deleteProgram);

// ============================================================
// ОФФЕРЫ
// ============================================================
router.get("/offers", getOffers);
router.get("/offers/active", getActiveOffers);
router.get("/offers/filter", getOffersFiltered);
router.get("/offers/rate-range", getRateRange);
router.get("/offers/:id", getOfferById);
router.post("/offers", createOffer);
router.put("/offers/:id", updateOffer);
router.delete("/offers/:id", deleteOffer);
router.post("/offers/:id/restore", restoreOffer);
router.delete("/offers/:id/hard", hardDeleteOffer);
router.post("/offers/:id/copy", copyOffer);

// ============================================================
// ДИНАМИЧЕСКИЕ СТАВКИ
// ============================================================
router.get("/rates", getAllDynamicRates);
router.get("/offers/:offerId/rates", getDynamicRatesByOffer);
router.post("/rates", createDynamicRate);
router.post("/offers/:offerId/rates", createDynamicRate);
router.put("/rates/:id", updateDynamicRate);
router.delete("/rates/:id", deleteDynamicRate);

// ============================================================
// ДИНАМИЧЕСКИЕ СУБСИДИИ
// ============================================================
router.get("/subsidies", getAllDynamicSubsidies);
router.get("/offers/:offerId/subsidies", getDynamicSubsidiesByOffer);
router.post("/subsidies", createDynamicSubsidy);
router.post("/offers/:offerId/subsidies", createDynamicSubsidy);
router.put("/subsidies/:id", updateDynamicSubsidy);
router.delete("/subsidies/:id", deleteDynamicSubsidy);

// ============================================================
// КОНФИГУРАЦИЯ
// ============================================================
router.get("/config", getConfig);
router.put("/config", updateConfig);

export default router;
