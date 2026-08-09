// backend/src/controllers/calculator.controller.ts
import { Request, Response } from "express";
import { calculateFullMortgage } from "../services/calculations/result/calculateFullMortgage";
import { ComplexService } from "../services/ComplexService";
import { OfferService } from "../services/OfferService";
import { ProgramService } from "../services/ProgramService";
import { variables } from "../data/limitdDate";
import { getMortgageSurcharge } from "../utils/mortgageSurcharges";
import { PRICE_PER_SQUARE_METER_DEFAULT } from "../data/constants";
import { ApartmentType } from "../entities/ApartmentType";
import { Offer } from "../entities/Offer";
import { Complex } from "../entities/Complex";
import { ProgramType } from "../types/types";

const complexService = new ComplexService();
const offerService = new OfferService();
const programService = new ProgramService();

export const calculate = async (req: Request, res: Response) => {
  try {
    const { formData, pricePerSquareMeter } = req.body;

    const complex = await complexService.getComplexByName(formData.complex);

    if (!complex) {
      return res.status(404).json({
        success: false,
        error: "Complex not found",
      });
    }

    const apartmentType = complex.apartmentTypes?.find(
      (at: ApartmentType) => at.type === formData.apartmentType,
    );

    const basePrice =
      pricePerSquareMeter ||
      apartmentType?.pricePerSquareMeter ||
      PRICE_PER_SQUARE_METER_DEFAULT;

    const surcharge = getMortgageSurcharge(
      formData.complex,
      formData.apartmentType,
      formData.mortgageWithoutDownPayment,
      formData.mortgagePartialDownPayment,
    );

    const finalPricePerM2 =
      formData.mortgageWithoutDownPayment || formData.mortgagePartialDownPayment
        ? basePrice + surcharge
        : basePrice;

    const offers = await offerService.getOffersByComplex(formData.complex);

    // 👇 ПРЕОБРАЗУЕМ null В undefined
    const bankOffers = offers.map((offer: Offer) => ({
      bank: offer.bank.name,
      program: offer.program,
      type: offer.programEntity.type as ProgramType,
      rate: offer.rate,
      twoRate: offer.twoRate ?? undefined, // null -> undefined
      shortRate: offer.shortRate ?? undefined, // null -> undefined
      subsidyPercent: offer.subsidyPercent,
      minPVPercent: offer.minPVPercent,
      durationMonths: offer.durationMonths ?? undefined, // null -> undefined
      isTwoContracts: offer.isTwoContracts ?? undefined, // false -> undefined если нужно
      excessLimit: offer.excessLimit ?? undefined,
      isTranche: offer.isTranche ?? undefined,
      trancheFirstPercent: offer.trancheFirstPercent ?? undefined,
      trancheSecondDate: offer.trancheSecondDate ?? undefined,
      complexes: offer.complexes ?? undefined,
    }));

    const result = calculateFullMortgage(
      formData,
      bankOffers,
      variables,
      finalPricePerM2 || PRICE_PER_SQUARE_METER_DEFAULT,
    );

    res.json({
      success: true,
      data: result,
      meta: {
        pricePerSquareMeter: finalPricePerM2,
        banksCount: bankOffers.length,
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

export const getComplexes = async (req: Request, res: Response) => {
  try {
    const complexes = await complexService.getAllComplexes();
    const complexNames = complexes.map((c: Complex) => c.name);
    res.json({ success: true, data: complexNames });
  } catch (error) {
    console.error("Error getting complexes:", error);
    res.status(500).json({ success: false, error: "Failed to get complexes" });
  }
};

export const getComplexTypes = async (req: Request, res: Response) => {
  try {
    const { complexName } = req.params;
    const complex = await complexService.getComplexByName(complexName);

    if (!complex) {
      return res.status(404).json({
        success: false,
        error: "Complex not found",
      });
    }

    const types =
      complex.apartmentTypes?.map((at: ApartmentType) => at.type) || [];
    res.json({ success: true, data: types });
  } catch (error) {
    console.error("Error getting apartment types:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get apartment types" });
  }
};

export const getPricePerSquareMeter = async (req: Request, res: Response) => {
  try {
    const complex = req.query.complex as string;
    const type = req.query.type as string;

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

    const apartmentType = complexData.apartmentTypes?.find(
      (at: ApartmentType) => at.type === type,
    );

    res.json({
      success: true,
      data:
        apartmentType?.pricePerSquareMeter || PRICE_PER_SQUARE_METER_DEFAULT,
    });
  } catch (error) {
    console.error("Error getting price:", error);
    res.status(500).json({ success: false, error: "Failed to get price" });
  }
};

export const getAvailableBanks = async (req: Request, res: Response) => {
  try {
    const { complexName, apartmentType } = req.params;

    const offers = await offerService.getOffersByComplex(complexName);
    const banks = Array.from(
      new Set(offers.map((offer: Offer) => offer.bank.name)),
    );

    res.json({ success: true, data: banks });
  } catch (error) {
    console.error("Error getting banks:", error);
    res.status(500).json({ success: false, error: "Failed to get banks" });
  }
};
