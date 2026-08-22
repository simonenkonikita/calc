// backend/src/controllers/projects.controller.ts

import { Request, Response } from "express";
import { ComplexService } from "../services/ComplexService";
import { ProgramService } from "../services/ProgramService";

const complexService = new ComplexService();
const programService = new ProgramService();

export const getProjects = async (req: Request, res: Response) => {
  try {
    const complexes = await complexService.getAllComplexes();

    // Трансформируем в формат, который ожидает фронтенд
    const projects = [];

    for (const complex of complexes) {
      // Получаем программы для этого ЖК
      const eligiblePrograms = await programService.getProgramsForComplex(
        complex.name,
      );

      if (complex.apartmentTypes && complex.apartmentTypes.length > 0) {
        for (const at of complex.apartmentTypes) {
          projects.push({
            id: complex.id,
            complexName: complex.name,
            status: complex.status,
            statusIcon:
              complex.status === "строится"
                ? "🏗️"
                : complex.status === "сдан"
                  ? "🏢"
                  : "🏠",
            description: complex.description,
            apartmentType: at.type,
            pricePerSquareMeter: at.pricePerSquareMeter,
            surcharges: at.surcharges || {
              withoutDownPayment: 0,
              partialDownPayment: 0,
            },
            banks: complex.banks || [],
            paymentTerms: complex.paymentTerms || [],
            promotions: complex.promotions || [],
            specialOffers: complex.specialOffers || [],
            materialsLink: complex.materialsLink,
            eligiblePrograms: eligiblePrograms, 
          });
        }
      }
    }

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Error getting projects:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get projects",
    });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const complex = await complexService.getComplexById(id);

    if (!complex) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    // Получаем программы для этого ЖК
    const eligiblePrograms = await programService.getProgramsForComplex(
      complex.name,
    );

    if (!complex.apartmentTypes || complex.apartmentTypes.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No apartment types found for this project",
      });
    }

    // Трансформируем в формат, который ожидает фронтенд
    const projects = complex.apartmentTypes.map((at) => ({
      id: complex.id,
      complexName: complex.name,
      status: complex.status,
      statusIcon:
        complex.status === "строится"
          ? "🏗️"
          : complex.status === "сдан"
            ? "🏢"
            : "🏠",
      description: complex.description,
      apartmentType: at.type,
      pricePerSquareMeter: at.pricePerSquareMeter,
      surcharges: at.surcharges || {
        withoutDownPayment: 0,
        partialDownPayment: 0,
      },
      banks: complex.banks || [],
      paymentTerms: complex.paymentTerms || [],
      promotions: complex.promotions || [],
      specialOffers: complex.specialOffers || [],
      materialsLink: complex.materialsLink,
      eligiblePrograms: eligiblePrograms,
    }));

    res.json({
      success: true,
      data: projects[0] || null,
    });
  } catch (error) {
    console.error("Error getting project:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get project",
    });
  }
};

export const getApartmentTypes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const complex = await complexService.getComplexById(id);

    if (!complex) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    const apartmentTypes =
      complex.apartmentTypes?.map((at) => ({
        type: at.type,
        pricePerSquareMeter: at.pricePerSquareMeter,
        surcharges: at.surcharges || {
          withoutDownPayment: 0,
          partialDownPayment: 0,
        },
      })) || [];

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
    const complex = await complexService.getComplexById(id);

    if (!complex) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    res.json({
      success: true,
      data: complex.banks || [],
    });
  } catch (error) {
    console.error("Error getting project banks:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get project banks",
    });
  }
};

export const getProjectPrograms = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const complex = await complexService.getComplexById(id);

    if (!complex) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    const eligiblePrograms = await programService.getProgramsForComplex(
      complex.name,
    );

    res.json({
      success: true,
      data: eligiblePrograms,
    });
  } catch (error) {
    console.error("Error getting project programs:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get project programs",
    });
  }
};
