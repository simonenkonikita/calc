import { Router } from "express";
import { landingController } from "../controllers/landing.controller";

const router = Router();

router.get("/stats", landingController.getStats.bind(landingController));

export default router;
