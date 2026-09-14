// backend/src/routes/projects.routes.ts

import { Router } from "express";
import {
  getProjects,
  getProjectById,
  getApartmentTypes,
  getProjectBanks,
  getProjectPrograms, // 🔥 ДОБАВЛЯЕМ ИМПОРТ
} from "../controllers/projects.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getProjects);
router.get("/:id", getProjectById);

router.get("/:id/types", getApartmentTypes);
router.get("/:id/banks", getProjectBanks);
router.get("/:id/programs", getProjectPrograms);

export default router;
