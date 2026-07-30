import { Router } from "express";
import {
  calculate,
  getComplexes,
  getComplexTypes,
  getPricePerSquareMeter,
  getAvailableBanks,
} from "../controllers/calculator.controller";

const router = Router();

router.post("/calculate", calculate);
router.get("/complexes", getComplexes);
router.get("/complexes/:complexName/types", getComplexTypes);
router.get("/price-per-square-meter", getPricePerSquareMeter);
router.get("/complexes/:complexName/:apartmentType/banks", getAvailableBanks);

export default router;
