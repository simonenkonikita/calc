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

const router = Router();

// ============================================================
// 🔥 БАНКИ
// ============================================================
router.get("/banks", bankController.getAll.bind(bankController));
router.get("/banks/:id", bankController.getOne.bind(bankController));
router.post("/banks", bankController.create.bind(bankController));
router.put("/banks/:id", bankController.update.bind(bankController));
router.delete("/banks/:id", bankController.delete.bind(bankController));

// ============================================================
// 🔥 ЖК (КОМПЛЕКСЫ)
// ============================================================
router.get("/complexes", complexController.getAll.bind(complexController));
router.get("/complexes/:id", complexController.getOne.bind(complexController));
router.post("/complexes", complexController.create.bind(complexController));
router.put("/complexes/:id", complexController.update.bind(complexController));
router.delete(
  "/complexes/:id",
  complexController.delete.bind(complexController),
);

// ============================================================
// 🔥 ТИПЫ КВАРТИР
// ============================================================
router.get(
  "/complexes/:complexId/apartment-types",
  apartmentTypeController.getByComplex.bind(apartmentTypeController),
);
router.post(
  "/complexes/:complexId/apartment-types",
  apartmentTypeController.create.bind(apartmentTypeController),
);
router.put(
  "/apartment-types/:id",
  apartmentTypeController.update.bind(apartmentTypeController),
);
router.delete(
  "/apartment-types/:id",
  apartmentTypeController.delete.bind(apartmentTypeController),
);

// ============================================================
// 🔥 ПРОГРАММЫ
// ============================================================
router.get("/programs", programController.getAll.bind(programController));
router.post("/programs", programController.create.bind(programController));
router.put("/programs/:id", programController.update.bind(programController));
router.delete(
  "/programs/:id",
  programController.delete.bind(programController),
);

// ============================================================
// 🔥 ОФФЕРЫ
// ============================================================
router.get("/offers", offerController.getAll.bind(offerController));
router.get("/offers/active", offerController.getActive.bind(offerController));
router.get("/offers/filter", offerController.getFiltered.bind(offerController));
router.get(
  "/offers/rate-range",
  offerController.getRateRange.bind(offerController),
);
router.get("/offers/:id", offerController.getOne.bind(offerController));
router.post("/offers", offerController.create.bind(offerController));
router.put("/offers/:id", offerController.update.bind(offerController));
router.delete("/offers/:id", offerController.delete.bind(offerController));
router.post(
  "/offers/:id/restore",
  offerController.restore.bind(offerController),
);
router.delete(
  "/offers/:id/hard",
  offerController.hardDelete.bind(offerController),
);
router.post("/offers/:id/copy", offerController.copy.bind(offerController));

// ============================================================
// 🔥 ДИНАМИЧЕСКИЕ СТАВКИ
// ============================================================
router.get("/dynamic-rates", rateController.getAll.bind(rateController));
router.get("/dynamic-rates/:id", rateController.getOne.bind(rateController));
router.get(
  "/offers/:offerId/dynamic-rates",
  rateController.getByOffer.bind(rateController),
);
router.post(
  "/offers/:offerId/dynamic-rates",
  rateController.create.bind(rateController),
);
router.put("/dynamic-rates/:id", rateController.update.bind(rateController));
router.delete("/dynamic-rates/:id", rateController.delete.bind(rateController));
router.delete(
  "/dynamic-rates/:id/hard",
  rateController.hardDelete.bind(rateController),
);
router.put(
  "/dynamic-rates/priorities",
  rateController.updatePriorities.bind(rateController),
);

// ============================================================
// 🔥 ДИНАМИЧЕСКИЕ СУБСИДИИ
// ============================================================
router.get(
  "/dynamic-subsidies",
  subsidyController.getAll.bind(subsidyController),
);
router.get(
  "/dynamic-subsidies/:id",
  subsidyController.getOne.bind(subsidyController),
);
router.get(
  "/offers/:offerId/dynamic-subsidies",
  subsidyController.getByOffer.bind(subsidyController),
);
router.post(
  "/offers/:offerId/dynamic-subsidies",
  subsidyController.create.bind(subsidyController),
);
router.put(
  "/dynamic-subsidies/:id",
  subsidyController.update.bind(subsidyController),
);
router.delete(
  "/dynamic-subsidies/:id",
  subsidyController.delete.bind(subsidyController),
);
router.delete(
  "/dynamic-subsidies/:id/hard",
  subsidyController.hardDelete.bind(subsidyController),
);
router.put(
  "/dynamic-subsidies/priorities",
  subsidyController.updatePriorities.bind(subsidyController),
);
router.post(
  "/dynamic-subsidies/copy",
  subsidyController.copyFromOffer.bind(subsidyController),
);

// ============================================================
// 🔥 КОНФИГУРАЦИЯ
// ============================================================
router.get("/config", configController.get.bind(configController));
router.put("/config", configController.update.bind(configController));

export default router;
