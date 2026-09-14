// backend/src/controllers/projects.controller.ts

import { Request, Response } from "express";
import { ComplexService } from "../services/ComplexService";
import { ProgramService } from "../services/ProgramService";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    companyId?: string;
  };
}

const complexService = new ComplexService();
const programService = new ProgramService();

// ============================================================
// GET /projects - все проекты с фильтрацией по компании
// ============================================================
export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const isAdmin = user?.role === "admin";
    const companyId = user?.companyId;

    let complexes;

    if (isAdmin) {
      complexes = await complexService.getAllComplexes();
    } else if (companyId) {
      complexes = await complexService.getComplexesByCompany(companyId);
    } else {
      return res.json({ success: true, data: [] });
    }

    const projects = [];

    for (const complex of complexes) {
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
            companyId: complex.companyId,
            description: complex.description || "",
            priceInfo: `${at.pricePerSquareMeter.toLocaleString()} ₽/м²`,
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
            materialsLink: complex.materialsLink || undefined,
            eligiblePrograms: [],
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

// ============================================================
// GET /projects/:id - проект по ID
// ============================================================
export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const complex = await complexService.getComplexById(id);

    if (!complex) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    const isAdmin = user?.role === "admin";
    const userCompanyId = user?.companyId;

    if (!isAdmin && complex.companyId !== userCompanyId) {
      return res.status(403).json({
        success: false,
        error: "Access denied: Project does not belong to your company",
      });
    }

    if (!complex.apartmentTypes || complex.apartmentTypes.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No apartment types found for this project",
      });
    }

    const projectData = complex.apartmentTypes.map((at) => ({
      id: complex.id,
      complexName: complex.name,
      status: complex.status,
      statusIcon:
        complex.status === "строится"
          ? "🏗️"
          : complex.status === "сдан"
            ? "🏢"
            : "🏠",
      companyId: complex.companyId,
      description: complex.description || "",
      priceInfo: `${at.pricePerSquareMeter.toLocaleString()} ₽/м²`,
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
      materialsLink: complex.materialsLink || undefined,
      eligiblePrograms: [],
    }));

    res.json({
      success: true,
      data: projectData[0] || null,
    });
  } catch (error) {
    console.error("Error getting project:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get project",
    });
  }
};

// ============================================================
// GET /projects/:id/types - типы квартир
// ============================================================
export const getApartmentTypes = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const complex = await complexService.getComplexById(id);

    if (!complex) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    const isAdmin = user?.role === "admin";
    const userCompanyId = user?.companyId;

    if (!isAdmin && complex.companyId !== userCompanyId) {
      return res.status(403).json({
        success: false,
        error: "Access denied: Project does not belong to your company",
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

// ============================================================
// GET /projects/:id/banks - банки проекта
// ============================================================
export const getProjectBanks = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const complex = await complexService.getComplexById(id);

    if (!complex) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    const isAdmin = user?.role === "admin";
    const userCompanyId = user?.companyId;

    if (!isAdmin && complex.companyId !== userCompanyId) {
      return res.status(403).json({
        success: false,
        error: "Access denied: Project does not belong to your company",
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

// ============================================================
// GET /projects/:id/programs - программы для проекта
// ============================================================
export const getProjectPrograms = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const complex = await complexService.getComplexById(id);

    if (!complex) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    const isAdmin = user?.role === "admin";
    const userCompanyId = user?.companyId;

    if (!isAdmin && complex.companyId !== userCompanyId) {
      return res.status(403).json({
        success: false,
        error: "Access denied: Project does not belong to your company",
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
      error: error instanceof Error ? error.message : "Failed to get programs",
    });
  }
};
