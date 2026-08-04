// backend/src/controllers/projects.controller.ts

import { Request, Response } from "express";
import { housingPrices } from "../data/complexPrice/complexPriceData";

export const getProjects = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: housingPrices,
    });
  } catch (error) {
    console.error("Error getting projects:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get projects",
    });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // 🔥 Ищем проект по id в housingPrices
    const project = housingPrices.find((p) => p.id === id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }
    
    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Error getting project:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get project",
    });
  }
};

export const getApartmentTypes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // 🔥 Находим все записи по id проекта
    const projectEntries = housingPrices.filter((p) => p.id === id);
    
    if (projectEntries.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }
    
    // 🔥 Извлекаем типы квартир
    const apartmentTypes = projectEntries.map((entry) => ({
      type: entry.apartmentType,
      pricePerSquareMeter: entry.pricePerSquareMeter,
      surcharges: entry.surcharges || { withoutDownPayment: 0, partialDownPayment: 0 },
    }));
    
    res.json({
      success: true,
      data: apartmentTypes,
    });
  } catch (error) {
    console.error("Error getting apartment types:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get apartment types",
    });
  }
};

export const getProjectBanks = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = housingPrices.find((p) => p.id === id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }
    
    res.json({
      success: true,
      data: project.banks || [],
    });
  } catch (error) {
    console.error("Error getting project banks:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get project banks",
    });
  }
};