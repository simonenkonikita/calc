// backend/src/controllers/calculator.controller.ts

import { Request, Response } from "express";
import { calculateFullMortgage } from "../services/calculations/result/calculateFullMortgage";
import { ComplexService } from "../services/ComplexService";
import { OfferService } from "../services/OfferService";
import { ConfigService } from "../services/ConfigService";
import {
  getMortgageSurcharge,
  findPricePerSquareMeter,
} from "../utils/mortgageSurcharges";
import { PRICE_PER_SQUARE_METER_DEFAULT } from "../data/constants";
import { ApartmentType } from "../entities/ApartmentType";
import { Offer } from "../entities/Offer";
import { Complex } from "../entities/Complex";

const complexService = new ComplexService();
const offerService = new OfferService();
const configService = new ConfigService();

export const calculate = async (req: Request, res: Response) => {
  try {
    const { formData } = req.body;

    // 1. Получаем ЖК
    const complex = await complexService.getComplexByName(formData.complex);
    if (!complex) {
      return res.status(404).json({
        success: false,
        error: "Complex not found",
      });
    }

    // 2. Получаем тип квартиры и цену за м²
    const apartmentType = complex.apartmentTypes?.find(
      (at: ApartmentType) => at.type === formData.apartmentType,
    );

    const basePrice =
      apartmentType?.pricePerSquareMeter || PRICE_PER_SQUARE_METER_DEFAULT;

    // 3. Наценка за специальные режимы (без ПВ / частичный ПВ)
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

    // 4. Получаем офферы из БД
    const offers: Offer[] = await offerService.getOffersByComplex(
      formData.complex,
    );

    // 5. Получаем Variables из БД
    const variables = await configService.getVariables();

    // 6. Вызываем калькулятор
    const result = calculateFullMortgage(
      formData,
      offers,
      variables,
      finalPricePerM2 || PRICE_PER_SQUARE_METER_DEFAULT,
    );

    res.json({
      success: true,
      data: result,
      meta: {
        pricePerSquareMeter: finalPricePerM2,
        surcharges: apartmentType?.surcharges || null,
        surchargeApplied: surcharge,
        banksCount: offers.length,
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
      complex.apartmentTypes?.map((at: ApartmentType) => ({
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

    if (!apartmentType) {
      return res.status(404).json({
        success: false,
        error: "Apartment type not found",
      });
    }

    // 🔥 Возвращаем объект с ценой и surcharges
    res.json({
      success: true,
      data: {
        pricePerSquareMeter:
          apartmentType.pricePerSquareMeter || PRICE_PER_SQUARE_METER_DEFAULT,
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

export const getAvailableBanks = async (req: Request, res: Response) => {
  try {
    const { complexName } = req.params;

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
