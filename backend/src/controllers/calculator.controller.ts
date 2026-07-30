import { Request, Response } from "express";
import { calculateFullMortgage } from "../services/calculations/result/calculateFullMortgage";
import { housingPrices } from "../data/complexPrice/complexPriceData";
import { bankOffers } from "../data/banks";
import { filterBankOffersByComplex } from "../utils/filterBankOffers";
import {
  findPricePerSquareMeter,
  getMortgageSurcharge,
} from "../utils/mortgageSurcharges";
import { PRICE_PER_SQUARE_METER_DEFAULT } from "../data/constants";
import { variables } from "../data/limitdDate";

export const calculate = async (req: Request, res: Response) => {
  try {
    const { formData, pricePerSquareMeter } = req.body;

    const basePrice =
      pricePerSquareMeter ||
      findPricePerSquareMeter(formData.complex, formData.apartmentType);

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

    const filteredBankOffers = filterBankOffersByComplex({
      bankOffers,
      complexName: formData.complex,
      apartmentType: formData.apartmentType,
      housingPrices,
    });

    const result = calculateFullMortgage(
      formData,
      filteredBankOffers,
      variables,
      finalPricePerM2 || PRICE_PER_SQUARE_METER_DEFAULT,
    );

    res.json({
      success: true,
      data: result,
      meta: {
        pricePerSquareMeter: finalPricePerM2,
        banksCount: filteredBankOffers.length,
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
    const complexes = Array.from(
      new Set(housingPrices.map((item) => item.complexName)),
    );
    res.json({ success: true, data: complexes });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to get complexes" });
  }
};

export const getComplexTypes = async (req: Request, res: Response) => {
  try {
    const { complexName } = req.params;
    const types = housingPrices
      .filter((item) => item.complexName === complexName)
      .map((item) => item.apartmentType);

    res.json({ success: true, data: types });
  } catch (error) {
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

    const price = findPricePerSquareMeter(complex, type);
    res.json({ success: true, data: price });
  } catch (error) {
    console.error("Error getting price:", error);
    res.status(500).json({ success: false, error: "Failed to get price" });
  }
};

export const getAvailableBanks = async (req: Request, res: Response) => {
  try {
    const { complexName, apartmentType } = req.params;
    const filtered = filterBankOffersByComplex({
      bankOffers,
      complexName,
      apartmentType,
      housingPrices,
    });

    const banks = Array.from(new Set(filtered.map((offer) => offer.bank)));
    res.json({ success: true, data: banks });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to get banks" });
  }
};
