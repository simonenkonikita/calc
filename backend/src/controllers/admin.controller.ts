// backend/src/controllers/admin.controller.ts (обновленный)

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Bank } from "../entities/Bank";
import { Complex } from "../entities/Complex";
import { Program } from "../entities/Program";
import { Offer } from "../entities/Offer";
import { DynamicRate } from "../entities/DynamicRate";
import { DynamicSubsidy } from "../entities/DynamicSubsidy";
import { Config } from "../entities/Config";
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
// 🔥 СТАВКИ
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
// 🔥 СУБСИДИИ
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
