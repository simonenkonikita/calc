// backend/src/routes/programs.routes.ts

import { Router } from "express";
import {
  getPrograms,
  getProgramCategories,
  getProgramById,
  getProgramByType,
} from "../controllers/programs.controller";

const router = Router();

// ============================================================
// 🔥 ПУБЛИЧНЫЕ ЭНДПОИНТЫ (для фронтенда)
// ============================================================
router.get("/", getPrograms);
router.get("/categories", getProgramCategories);
router.get("/:id", getProgramById);
router.get("/type/:type", getProgramByType);

export default router;
