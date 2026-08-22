// backend/src/routes/config.ts

import { Router } from "express";
import { DEPOSIT_AMOUNT } from "../data/complexPrice/CONSTRUCTION";

const router = Router();

router.get("/config", (req, res) => {
  res.json({
    success: true,
    data: {
      depositAmount: DEPOSIT_AMOUNT,
    },
  });
});

export default router;
