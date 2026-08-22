// backend/src/routes/banks.routes.ts

import { Router } from "express";
import {
  getAllBanks,
  getBankById,
  getBankOffers,
} from "../controllers/banks.controller";

const router = Router();

// Публичные эндпоинты для банков (без CRUD)
router.get("/", getAllBanks);
router.get("/:id", getBankById);
router.get("/:bankName/offers", getBankOffers);

export default router;
