// backend/src/routes/config.routes.ts

import { Router } from "express";
import { getConfig } from "../controllers/config.controller";

const router = Router();

// 🔥 Публичные (для фронтенда и калькулятора)
router.get("/", getConfig);

export default router;
