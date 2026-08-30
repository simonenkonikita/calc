// backend/src/controllers/programs.controller.ts

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Program } from "../entities/Program";

const programRepository = AppDataSource.getRepository(Program);

/**
 * Получить все активные программы (для фронтенда)
 */
export const getPrograms = async (req: Request, res: Response) => {
  try {
    const programs = await programRepository.find({
      where: { isActive: true },
      order: { displayOrder: "ASC" },
    });

    res.json({
      success: true,
      data: programs,
    });
  } catch (error) {
    console.error("Error getting programs:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get programs",
    });
  }
};

/**
 * Получить категории программ для отображения на фронтенде
 */
export const getProgramCategories = async (req: Request, res: Response) => {
  try {
    const programs = await programRepository.find({
      where: { isActive: true },
      order: { displayOrder: "ASC" },
    });

    const categories = programs.map((program) => ({
      key: program.type,
      label: `${program.icon} ${program.label}`,
      type: program.type,
      icon: program.icon,
      color: program.color,
      description: program.description,
      displayOrder: program.displayOrder,
    }));

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error getting program categories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get program categories",
    });
  }
};

/**
 * Получить программу по ID
 */
export const getProgramById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const program = await programRepository.findOne({
      where: { id, isActive: true },
    });

    if (!program) {
      return res.status(404).json({
        success: false,
        error: "Program not found",
      });
    }

    res.json({
      success: true,
      data: program,
    });
  } catch (error) {
    console.error("Error getting program:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get program",
    });
  }
};

/**
 * Получить программу по типу (например, "family", "it")
 */
export const getProgramByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const program = await programRepository.findOne({
      where: { type, isActive: true },
    });

    if (!program) {
      return res.status(404).json({
        success: false,
        error: `Program with type "${type}" not found`,
      });
    }

    res.json({
      success: true,
      data: program,
    });
  } catch (error) {
    console.error("Error getting program by type:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get program",
    });
  }
};
