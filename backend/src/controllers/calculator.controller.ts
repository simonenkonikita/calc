// backend/src/controllers/calculator.controller.ts

import { Request, Response } from "express";
import { calculateFullMortgage } from "../services/calculations/result/calculateFullMortgage";
import { ComplexService } from "../services/ComplexService";
import { OfferService } from "../services/OfferService";
import { ConfigService } from "../services/ConfigService";
import {
  getMortgageSurcharge,
  findPricePerSquareMeter,
  getPriceInfo, // ✅ Добавляем импорт
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
    const { formData, surcharges: clientSurcharges } = req.body;

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

    // ✅ Используем наценки от клиента, если они переданы, или загружаем из БД
    let surcharges = clientSurcharges;
    if (!surcharges && apartmentType) {
      surcharges = apartmentType.surcharges || {
        withoutDownPayment: 0,
        partialDownPayment: 0,
      };
    }

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
      data: {
        ...result,
        surcharges, // ✅ Возвращаем наценки клиенту
      },
      meta: {
        pricePerSquareMeter: finalPricePerM2,
        surcharges: surcharges || null,
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
    // ✅ Возвращаем полную информацию, а не только имена
    const complexData = complexes.map((c: Complex) => ({
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
      apartmentTypes: c.apartmentTypes?.map((at: ApartmentType) => ({
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

// ✅ НОВЫЙ ЭНДПОИНТ: Получение только наценок
export const getSurcharges = async (req: Request, res: Response) => {
  try {
    const complex = req.query.complex as string;
    const type = req.query.type as string;

    if (!complex || !type) {
      return res.status(400).json({
        success: false,
        error: "Missing parameters: complex and type are required",
      });
    }

    const priceInfo = await getPriceInfo(complex, type);
    
    if (!priceInfo) {
      return res.status(404).json({
        success: false,
        error: "Price info not found",
      });
    }

    res.json({
      success: true,
      data: {
        surcharges: priceInfo.surcharges,
        pricePerSquareMeter: priceInfo.pricePerSquareMeter,
      },
    });
  } catch (error) {
    console.error("Error getting surcharges:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get surcharges" 
    });
  }
};

export const getAvailableBanks = async (req: Request, res: Response) => {
  try {
    const { complexName, apartmentType } = req.params;

    // ✅ Получаем банки с наценками
    const offers = await offerService.getOffersByComplex(complexName);
    const complex = await complexService.getComplexByName(complexName);
    
    // Находим тип квартиры для получения наценок
    const apartmentTypeData = complex?.apartmentTypes?.find(
      (at: ApartmentType) => at.type === apartmentType
    );

    const banks = offers.map((offer: Offer) => ({
      name: offer.bank.name,
      bankId: offer.bank.id,
      offers: [offer],
    }));

    // Группируем по банкам
    const banksMap = new Map();
    banks.forEach((bank: any) => {
      if (!banksMap.has(bank.name)) {
        banksMap.set(bank.name, {
          name: bank.name,
          bankId: bank.bankId,
          offers: [],
        });
      }
      banksMap.get(bank.name).offers.push(...bank.offers);
    });

    res.json({
      success: true,
      data: {
        banks: Array.from(banksMap.values()),
        surcharges: apartmentTypeData?.surcharges || {
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