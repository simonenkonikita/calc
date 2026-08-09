// backend/src/routes/admin.routes.ts

import { Router } from "express";
import {
  getBanks,
  updateBank,
  getComplexes,
  updateComplex,
  createComplex,
  deleteComplex,
  getPrograms,
  getRates,
  getSubsidies,
  getConfig,
  updateConfig,
  // 🔥 НОВЫЕ МЕТОДЫ
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  restoreOffer,
  getAllDynamicRates,
  getDynamicRatesByOffer,
  createDynamicRate,
  updateDynamicRate,
  deleteDynamicRate,
  getAllDynamicSubsidies,
  getDynamicSubsidiesByOffer,
  createDynamicSubsidy,
  updateDynamicSubsidy,
  deleteDynamicSubsidy,
} from "../controllers/admin.controller";

const router = Router();

// ============================================================
// БАНКИ
// ============================================================
router.get("/banks", getBanks);
router.put("/banks/:id", updateBank);

// ============================================================
// ЖК (КОМПЛЕКСЫ)
// ============================================================
router.get("/complexes", getComplexes);
router.put("/complexes/:id", updateComplex);
router.post("/complexes", createComplex);
router.delete("/complexes/:id", deleteComplex);

// ============================================================
// ПРОГРАММЫ
// ============================================================
router.get("/programs", getPrograms);

// ============================================================
// ОФФЕРЫ
// ============================================================
router.get("/offers", getOffers);
router.get("/offers/:id", getOfferById);
router.post("/offers", createOffer);
router.put("/offers/:id", updateOffer);
router.delete("/offers/:id", deleteOffer);
router.post("/offers/:id/restore", restoreOffer);

// ============================================================
// ДИНАМИЧЕСКИЕ СТАВКИ
// ============================================================
router.get("/rates", getAllDynamicRates);
router.get("/offers/:offerId/rates", getDynamicRatesByOffer);
router.post("/offers/:offerId/rates", createDynamicRate);
router.put("/rates/:id", updateDynamicRate);
router.delete("/rates/:id", deleteDynamicRate);

// ============================================================
// ДИНАМИЧЕСКИЕ СУБСИДИИ
// ============================================================
router.get("/subsidies", getAllDynamicSubsidies);
router.get("/offers/:offerId/subsidies", getDynamicSubsidiesByOffer);
router.post("/offers/:offerId/subsidies", createDynamicSubsidy);
router.put("/subsidies/:id", updateDynamicSubsidy);
router.delete("/subsidies/:id", deleteDynamicSubsidy);

// ============================================================
// КОНФИГУРАЦИЯ
// ============================================================
router.get("/config", getConfig);
router.put("/config", updateConfig);

export default router;
