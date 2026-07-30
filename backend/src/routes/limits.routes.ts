// backend/src/routes/limits.routes.ts

import { Router } from "express";
import { getLimits } from "../controllers/limits.controller";

const router = Router();

router.get("/", getLimits);

export default router;
