// backend/src/routes/projects.routes.ts

import { Router } from "express";
import {
  getProjects,
  getProjectById,
  getApartmentTypes,
  getProjectBanks,
} from "../controllers/projects.controller";

const router = Router();

router.get("/", getProjects);
router.get("/:id", getProjectById);
router.get("/:id/types", getApartmentTypes);
router.get("/:id/banks", getProjectBanks);

export default router;
