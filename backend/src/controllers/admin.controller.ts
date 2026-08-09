// backend/src/controllers/admin.controller.ts (ПОЛНОСТЬЮ ОБНОВЛЕННЫЙ)

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Bank } from "../entities/Bank";
import { Complex } from "../entities/Complex";
import { Program } from "../entities/Program";
import { Offer } from "../entities/Offer";
import { DynamicRate } from "../entities/DynamicRate";
import { DynamicSubsidy } from "../entities/DynamicSubsidy";
import { Config } from "../entities/Config";
import { OfferService } from "../services/OfferService";
import {
  BANK_NAMES,
  BASE_RATES,
  MIN_PV_PERCENT,
} from "../data/banks/constants";

const bankRepository = AppDataSource.getRepository(Bank);
const complexRepository = AppDataSource.getRepository(Complex);
const programRepository = AppDataSource.getRepository(Program);
const offerRepository = AppDataSource.getRepository(Offer);
const rateRepository = AppDataSource.getRepository(DynamicRate);
const subsidyRepository = AppDataSource.getRepository(DynamicSubsidy);
const configRepository = AppDataSource.getRepository(Config);

const offerService = new OfferService();

// ============================================================
// 🔥 БАНКИ
// ============================================================
export const getBanks = async (req: Request, res: Response) => {
  try {
    const banks = await bankRepository.find({
      order: { displayOrder: "ASC" },
    });
    res.json(banks);
  } catch (error) {
    console.error("Error getting banks:", error);
    res.status(500).json({ error: "Failed to get banks" });
  }
};

export const updateBank = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    await bankRepository.update(id, data);
    const updated = await bankRepository.findOneBy({ id });
    res.json(updated);
  } catch (error) {
    console.error("Error updating bank:", error);
    res.status(500).json({ error: "Failed to update bank" });
  }
};

// ============================================================
// 🔥 ЖК (КОМПЛЕКСЫ)
// ============================================================
export const getComplexes = async (req: Request, res: Response) => {
  try {
    const complexes = await complexRepository.find({
      order: { name: "ASC" },
    });
    res.json(complexes);
  } catch (error) {
    console.error("Error getting complexes:", error);
    res.status(500).json({ error: "Failed to get complexes" });
  }
};

export const updateComplex = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    await complexRepository.update(id, data);
    const updated = await complexRepository.findOneBy({ id });
    res.json(updated);
  } catch (error) {
    console.error("Error updating complex:", error);
    res.status(500).json({ error: "Failed to update complex" });
  }
};

export const createComplex = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const complex = complexRepository.create(data);
    await complexRepository.save(complex);
    res.status(201).json(complex);
  } catch (error) {
    console.error("Error creating complex:", error);
    res.status(500).json({ error: "Failed to create complex" });
  }
};

export const deleteComplex = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await complexRepository.delete(id);
    res.json({ success: true, message: "Complex deleted" });
  } catch (error) {
    console.error("Error deleting complex:", error);
    res.status(500).json({ error: "Failed to delete complex" });
  }
};

// ============================================================
// 🔥 ПРОГРАММЫ
// ============================================================
export const getPrograms = async (req: Request, res: Response) => {
  try {
    const programs = await programRepository.find();
    res.json(programs);
  } catch (error) {
    console.error("Error getting programs:", error);
    res.status(500).json({ error: "Failed to get programs" });
  }
};

// ============================================================
// 🔥 СТАВКИ (существующие)
// ============================================================
export const getRates = async (req: Request, res: Response) => {
  try {
    const rates = await rateRepository.find({
      relations: ["offer", "offer.bank"],
    });
    res.json(rates);
  } catch (error) {
    console.error("Error getting rates:", error);
    res.status(500).json({ error: "Failed to get rates" });
  }
};

// ============================================================
// 🔥 СУБСИДИИ (существующие)
// ============================================================
export const getSubsidies = async (req: Request, res: Response) => {
  try {
    const subsidies = await subsidyRepository.find({
      relations: ["offer", "offer.bank"],
    });
    res.json(subsidies);
  } catch (error) {
    console.error("Error getting subsidies:", error);
    res.status(500).json({ error: "Failed to get subsidies" });
  }
};

// ============================================================
// 🔥 КОНФИГУРАЦИЯ
// ============================================================
export const getConfig = async (req: Request, res: Response) => {
  try {
    const config = await configRepository.findOne({
      where: { key: "app_config" },
    });
    res.json(config?.value || {});
  } catch (error) {
    console.error("Error getting config:", error);
    res.status(500).json({ error: "Failed to get config" });
  }
};

export const updateConfig = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    let config = await configRepository.findOne({
      where: { key: "app_config" },
    });

    if (!config) {
      config = new Config();
      config.key = "app_config";
    }
    config.value = { ...config.value, ...data };
    await configRepository.save(config);
    res.json(config.value);
  } catch (error) {
    console.error("Error updating config:", error);
    res.status(500).json({ error: "Failed to update config" });
  }
};

// ============================================================
// 🔥 ОФФЕРЫ (НОВЫЕ МЕТОДЫ)
// ============================================================

// Получить все офферы с новыми полями
export const getOffers = async (req: Request, res: Response) => {
  try {
    const offers = await offerService.getAllOffers();
    res.json({
      success: true,
      data: offers,
    });
  } catch (error) {
    console.error("Error getting offers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get offers",
    });
  }
};

// Получить оффер по ID
export const getOfferById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const offer = await offerService.getOfferById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: "Offer not found",
      });
    }

    res.json({
      success: true,
      data: offer,
    });
  } catch (error) {
    console.error("Error getting offer:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get offer",
    });
  }
};

// Создать оффер
export const createOffer = async (req: Request, res: Response) => {
  try {
    const offer = await offerService.createOffer(req.body);
    res.status(201).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    console.error("Error creating offer:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to create offer",
    });
  }
};

// Обновить оффер
export const updateOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const offer = await offerService.updateOffer(id, req.body);
    res.json({
      success: true,
      data: offer,
    });
  } catch (error) {
    console.error("Error updating offer:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update offer",
    });
  }
};

// Удалить оффер (мягкое удаление)
export const deleteOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await offerService.deleteOffer(id);
    res.json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting offer:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete offer",
    });
  }
};

// Восстановить оффер
export const restoreOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await offerService.restoreOffer(id);
    res.json({
      success: true,
      message: "Offer restored successfully",
    });
  } catch (error) {
    console.error("Error restoring offer:", error);
    res.status(500).json({
      success: false,
      error: "Failed to restore offer",
    });
  }
};

// ============================================================
// 🔥 ДИНАМИЧЕСКИЕ СТАВКИ (CRUD)
// ============================================================

// Получить все динамические ставки
export const getAllDynamicRates = async (req: Request, res: Response) => {
  try {
    const rates = await rateRepository.find({
      relations: ["offer", "offer.bank"],
      where: { isActive: true },
      order: { priority: "ASC" },
    });
    res.json({
      success: true,
      data: rates,
    });
  } catch (error) {
    console.error("Error getting dynamic rates:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get dynamic rates",
    });
  }
};

// Получить динамические ставки для конкретного оффера
export const getDynamicRatesByOffer = async (req: Request, res: Response) => {
  try {
    const { offerId } = req.params;
    const rates = await rateRepository.find({
      where: { offerId, isActive: true },
      order: { priority: "ASC" },
    });
    res.json({
      success: true,
      data: rates,
    });
  } catch (error) {
    console.error("Error getting dynamic rates by offer:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get dynamic rates",
    });
  }
};

// Создать динамическую ставку
export const createDynamicRate = async (req: Request, res: Response) => {
  try {
    const { offerId } = req.params;
    const data = req.body;

    const offer = await offerRepository.findOne({
      where: { id: offerId },
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: "Offer not found",
      });
    }

    const rate = rateRepository.create({
      ...data,
      offerId,
    });

    await rateRepository.save(rate);
    res.status(201).json({
      success: true,
      data: rate,
    });
  } catch (error) {
    console.error("Error creating dynamic rate:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create dynamic rate",
    });
  }
};

// Обновить динамическую ставку
export const updateDynamicRate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const rate = await rateRepository.findOne({
      where: { id },
    });

    if (!rate) {
      return res.status(404).json({
        success: false,
        error: "Dynamic rate not found",
      });
    }

    await rateRepository.update(id, data);
    const updated = await rateRepository.findOne({
      where: { id },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating dynamic rate:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update dynamic rate",
    });
  }
};

// Удалить динамическую ставку (мягкое удаление)
export const deleteDynamicRate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await rateRepository.update(id, { isActive: false });
    res.json({
      success: true,
      message: "Dynamic rate deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting dynamic rate:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete dynamic rate",
    });
  }
};

// ============================================================
// 🔥 ДИНАМИЧЕСКИЕ СУБСИДИИ (CRUD)
// ============================================================

// Получить все динамические субсидии
export const getAllDynamicSubsidies = async (req: Request, res: Response) => {
  try {
    const subsidies = await subsidyRepository.find({
      relations: ["offer", "offer.bank"],
      where: { isActive: true },
      order: { priority: "ASC" },
    });
    res.json({
      success: true,
      data: subsidies,
    });
  } catch (error) {
    console.error("Error getting dynamic subsidies:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get dynamic subsidies",
    });
  }
};

// Получить динамические субсидии для конкретного оффера
export const getDynamicSubsidiesByOffer = async (
  req: Request,
  res: Response,
) => {
  try {
    const { offerId } = req.params;
    const subsidies = await subsidyRepository.find({
      where: { offerId, isActive: true },
      order: { priority: "ASC" },
    });
    res.json({
      success: true,
      data: subsidies,
    });
  } catch (error) {
    console.error("Error getting dynamic subsidies by offer:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get dynamic subsidies",
    });
  }
};

// Создать динамическую субсидию
export const createDynamicSubsidy = async (req: Request, res: Response) => {
  try {
    const { offerId } = req.params;
    const data = req.body;

    const offer = await offerRepository.findOne({
      where: { id: offerId },
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: "Offer not found",
      });
    }

    const subsidy = subsidyRepository.create({
      ...data,
      offerId,
    });

    await subsidyRepository.save(subsidy);
    res.status(201).json({
      success: true,
      data: subsidy,
    });
  } catch (error) {
    console.error("Error creating dynamic subsidy:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create dynamic subsidy",
    });
  }
};

// Обновить динамическую субсидию
export const updateDynamicSubsidy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const subsidy = await subsidyRepository.findOne({
      where: { id },
    });

    if (!subsidy) {
      return res.status(404).json({
        success: false,
        error: "Dynamic subsidy not found",
      });
    }

    await subsidyRepository.update(id, data);
    const updated = await subsidyRepository.findOne({
      where: { id },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating dynamic subsidy:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update dynamic subsidy",
    });
  }
};

// Удалить динамическую субсидию (мягкое удаление)
export const deleteDynamicSubsidy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await subsidyRepository.update(id, { isActive: false });
    res.json({
      success: true,
      message: "Dynamic subsidy deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting dynamic subsidy:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete dynamic subsidy",
    });
  }
};
