// backend/src/routes/admin.routes.ts

import { Router } from "express";
import {
  getBanks,
  getComplexes,
  getConfig,
  getPrograms,
  getRates,
  getSubsidies,
  updateConfig,
} from "../controllers/admin.controller";

const router = Router();

router.get("/banks", getBanks);
router.get("/complexes", getComplexes);
router.get("/programs", getPrograms);
router.get("/rates", getRates);
router.get("/subsidies", getSubsidies);
router.get("/config", getConfig);
router.put("/config", updateConfig);

export default router;
