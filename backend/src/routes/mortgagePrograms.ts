// backend/src/routes/projects.ts

import { Router } from "express";
import { housingPrices } from "../data/complexPrice/complexPriceData";

const router = Router();

router.get("/projects", (req, res) => {
  res.json({
    success: true,
    data: housingPrices,
  });
});

export default router;
