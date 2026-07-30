import { Router } from "express";
import {
  getAllBanks,
  getAllOffers,
  getBankOffers,
} from "../controllers/banks.controller";

const router = Router();

router.get("/banks", getAllBanks);
router.get("/offers", getAllOffers);
router.get("/banks/:bankName/offers", getBankOffers);

export default router;
