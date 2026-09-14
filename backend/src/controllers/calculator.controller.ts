// backend/src/controllers/calculator.controller.ts

import { Request, Response } from "express";
import { calculateFullMortgage } from "../services/calculations/result/calculateFullMortgage";
import { ComplexService } from "../services/ComplexService";
import { OfferService } from "../services/OfferService";
import { ConfigService } from "../services/ConfigService";
import {
  getMortgageSurcharge,
  getPriceInfo,
} from "../utils/mortgageSurcharges";
import { ApartmentType } from "../entities/ApartmentType";
import { Offer } from "../entities/Offer";
import { Complex } from "../entities/Complex";
import { AuthRequest } from "../types/auth.types";

const complexService = new ComplexService();
const offerService = new OfferService();
const configService = new ConfigService();

// ============================================================
// CALCULATE С ПРОВЕРКОЙ ПРАВ
// ============================================================
export const calculate = async (req: AuthRequest, res: Response) => {
  try {
    const { formData } = req.body;
    const user = req.user;

    const complex = await complexService.getComplexByName(formData.complex);
    if (!complex) {
      return res.status(404).json({
        success: false,
        error: "Complex not found",
      });
    }

    if (user && user.role !== "admin") {
      if (complex.companyId !== user.companyId) {
        return res.status(403).json({
          success: false,
          error:
            "Access denied. You don't have permission to calculate for this complex",
        });
      }
    }

    const apartmentType = complex.apartmentTypes?.find(
      (at: ApartmentType) => at.type === formData.apartmentType,
    );

    if (!apartmentType) {
      return res.status(404).json({
        success: false,
        error: "Apartment type not found",
      });
    }

    const basePrice = Number(apartmentType.pricePerSquareMeter);

    const config = await configService.getConfig();
    const variables = await configService.getVariables();

    const surcharge = await getMortgageSurcharge(
      formData.complex,
      formData.apartmentType,
      formData.mortgageWithoutDownPayment,
      formData.mortgagePartialDownPayment,
    );

    const finalPricePerM2 =
      formData.mortgageWithoutDownPayment || formData.mortgagePartialDownPayment
        ? basePrice + surcharge
        : basePrice;

    const priceInfo = await getPriceInfo(
      formData.complex,
      formData.apartmentType,
    );
    const surcharges = priceInfo?.surcharges || {
      withoutDownPayment: 0,
      partialDownPayment: 0,
    };

    const offers: Offer[] = await offerService.getOffersByComplex(
      formData.complex,
    );

    const result = calculateFullMortgage(
      formData,
      offers,
      variables,
      finalPricePerM2,
      config.minDownPaymentPercent,
      formData.area,
    );

    res.json({
      success: true,
      data: {
        ...result,
        surcharges,
      },
      meta: {
        basePricePerSquareMeter: basePrice,
        finalPricePerSquareMeter: finalPricePerM2,
        surcharges: surcharges,
        surchargeApplied: surcharge,
        banksCount: offers.length,
        apartmentTypeId: apartmentType.id,
        complexId: complex.id,
      },
    });
  } catch (error) {
    console.error("Calculation error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Calculation failed",
    });
  }
};

// ============================================================
// GET COMPLEXES С ФИЛЬТРАЦИЕЙ ПО КОМПАНИИ
// ============================================================
export const getComplexes = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    const complexes = await complexService.getAllComplexes();

    let filteredComplexes = complexes;

    if (user && user.role !== "admin" && user.companyId) {
      filteredComplexes = complexes.filter(
        (c: Complex) => c.companyId === user.companyId,
      );
    } else if (user && user.role !== "admin" && !user.companyId) {
      filteredComplexes = [];
    }

    const complexData = filteredComplexes.map((c: Complex) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      status: c.status,
      description: c.description,
      banks: c.banks || [],
      paymentTerms: c.paymentTerms || [],
      promotions: c.promotions || [],
      specialOffers: c.specialOffers || [],
      materialsLink: c.materialsLink,
      isActive: c.isActive,
      companyId: c.companyId,
      apartmentTypes:
        c.apartmentTypes?.map((at: ApartmentType) => ({
          id: at.id,
          type: at.type,
          pricePerSquareMeter: at.pricePerSquareMeter,
          surcharges: at.surcharges || {
            withoutDownPayment: 0,
            partialDownPayment: 0,
          },
          isActive: at.isActive,
        })) || [],
    }));

    res.json({ success: true, data: complexData });
  } catch (error) {
    console.error("Error getting complexes:", error);
    res.status(500).json({ success: false, error: "Failed to get complexes" });
  }
};

// ============================================================
// GET COMPLEX TYPES С ПРОВЕРКОЙ ПРАВ
// ============================================================
export const getComplexTypes = async (req: AuthRequest, res: Response) => {
  try {
    const { complexName } = req.params;
    const user = req.user;

    const complex = await complexService.getComplexByName(complexName);

    if (!complex) {
      return res.status(404).json({
        success: false,
        error: "Complex not found",
      });
    }

    if (user && user.role !== "admin") {
      if (complex.companyId !== user.companyId) {
        return res.status(403).json({
          success: false,
          error:
            "Access denied. You don't have permission to view this complex",
        });
      }
    }

    const types =
      complex.apartmentTypes?.map((at: ApartmentType) => ({
        id: at.id,
        type: at.type,
        pricePerSquareMeter: at.pricePerSquareMeter,
        surcharges: at.surcharges || {
          withoutDownPayment: 0,
          partialDownPayment: 0,
        },
        isActive: at.isActive,
      })) || [];

    res.json({ success: true, data: types });
  } catch (error) {
    console.error("Error getting apartment types:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get apartment types" });
  }
};

// ============================================================
// GET PRICE PER SQUARE METER С ПРОВЕРКОЙ ПРАВ
// ============================================================
export const getPricePerSquareMeter = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const complex = req.query.complex as string;
    const type = req.query.type as string;
    const user = req.user;

    if (!complex || !type) {
      return res.status(400).json({
        success: false,
        error: "Missing parameters: complex and type are required",
      });
    }

    const complexData = await complexService.getComplexByName(complex);
    if (!complexData) {
      return res.status(404).json({
        success: false,
        error: "Complex not found",
      });
    }

    if (user && user.role !== "admin") {
      if (complexData.companyId !== user.companyId) {
        return res.status(403).json({
          success: false,
          error:
            "Access denied. You don't have permission to view this complex",
        });
      }
    }

    const apartmentType = complexData.apartmentTypes?.find(
      (at: ApartmentType) => at.type === type,
    );

    if (!apartmentType) {
      return res.status(404).json({
        success: false,
        error: "Apartment type not found",
      });
    }

    res.json({
      success: true,
      data: {
        pricePerSquareMeter: apartmentType.pricePerSquareMeter,
        surcharges: apartmentType.surcharges || {
          withoutDownPayment: 0,
          partialDownPayment: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error getting price:", error);
    res.status(500).json({ success: false, error: "Failed to get price" });
  }
};

// ============================================================
// GET AVAILABLE BANKS С ПРОВЕРКОЙ ПРАВ
// ============================================================
export const getAvailableBanks = async (req: AuthRequest, res: Response) => {
  try {
    const { complexName, apartmentType } = req.params;
    const user = req.user;

    const complex = await complexService.getComplexByName(complexName);
    if (!complex) {
      return res.status(404).json({
        success: false,
        error: "Complex not found",
      });
    }

    if (user && user.role !== "admin") {
      if (complex.companyId !== user.companyId) {
        return res.status(403).json({
          success: false,
          error:
            "Access denied. You don't have permission to view this complex",
        });
      }
    }

    const offers = await offerService.getOffersByComplex(complexName);

    const apartmentTypeData = complex.apartmentTypes?.find(
      (at: ApartmentType) => at.type === apartmentType,
    );

    if (!apartmentTypeData) {
      return res.status(404).json({
        success: false,
        error: "Apartment type not found",
      });
    }

    const banksMap = new Map();
    offers.forEach((offer: Offer) => {
      if (!offer.bank) return;

      if (!banksMap.has(offer.bank.id)) {
        banksMap.set(offer.bank.id, {
          id: offer.bank.id,
          name: offer.bank.name,
          slug: offer.bank.slug,
          offers: [],
        });
      }
      banksMap.get(offer.bank.id).offers.push(offer);
    });

    res.json({
      success: true,
      data: {
        banks: Array.from(banksMap.values()),
        surcharges: apartmentTypeData.surcharges || {
          withoutDownPayment: 0,
          partialDownPayment: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error getting banks:", error);
    res.status(500).json({ success: false, error: "Failed to get banks" });
  }
};
