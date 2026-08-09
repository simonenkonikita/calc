// backend/src/controllers/programs.controller.ts
import { Request, Response } from "express";
import { ProgramService } from "../services/ProgramService";
import { ComplexService } from "../services/ComplexService";
import { CATEGORY_ORDER } from "../data/banks/constants";

const programService = new ProgramService();
const complexService = new ComplexService();

export const getProgramsConfig = async (req: Request, res: Response) => {
  try {
    const programs = await programService.getAllPrograms();

    // Группируем программы по категориям
    const categories = CATEGORY_ORDER.map((cat) => ({
      ...cat,
      programs: programs.filter((p) => cat.types.includes(p.type)),
    }));

    res.json({
      success: true,
      data: {
        categories,
        programs,
      },
    });
  } catch (error) {
    console.error("Error getting programs config:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get programs config",
    });
  }
};

export const getProgramsForComplex = async (req: Request, res: Response) => {
  try {
    const { complexName } = req.params;
    const programs = await programService.getProgramsForComplex(complexName);

    res.json({
      success: true,
      data: programs,
    });
  } catch (error) {
    console.error("Error getting programs for complex:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get programs for complex",
    });
  }
};
