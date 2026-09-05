// backend/src/routes/calculator.routes.ts

import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware"; // 🔥 ДОБАВЛЯЕМ
import {
  calculate,
  getComplexes,
  getComplexTypes,
  getPricePerSquareMeter,
  getAvailableBanks,
} from "../controllers/calculator.controller";

const router = Router();

// 🔥 ВСЕ ЭНДПОИНТЫ ЗАЩИЩЕНЫ АВТОРИЗАЦИЕЙ
router.post("/calculate", authMiddleware, calculate);
router.get("/complexes", authMiddleware, getComplexes);
router.get("/complexes/:complexName/types", authMiddleware, getComplexTypes);
router.get("/price-per-square-meter", authMiddleware, getPricePerSquareMeter);
router.get(
  "/complexes/:complexName/:apartmentType/banks",
  authMiddleware,
  getAvailableBanks,
);

export default router;
