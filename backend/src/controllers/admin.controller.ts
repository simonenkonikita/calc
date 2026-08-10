// backend/src/controllers/admin.controller.ts

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Bank } from "../entities/Bank";
import { Complex } from "../entities/Complex";
import { ApartmentType } from "../entities/ApartmentType";
import { Program } from "../entities/Program";
import { Offer } from "../entities/Offer";
import { DynamicRate } from "../entities/DynamicRate";
import { DynamicSubsidy } from "../entities/DynamicSubsidy";
import { Config } from "../entities/Config";
import { OfferService } from "../services/OfferService";
import { CreateOfferDTO, UpdateOfferDTO } from "../dtos/OfferDto";
import { CreateBankDTO, UpdateBankDTO } from "../dtos/BankDto";
import ConfigService from "../services/ConfigService";

const bankRepository = AppDataSource.getRepository(Bank);
const complexRepository = AppDataSource.getRepository(Complex);
const apartmentTypeRepository = AppDataSource.getRepository(ApartmentType);
const programRepository = AppDataSource.getRepository(Program);
const offerRepository = AppDataSource.getRepository(Offer);
const rateRepository = AppDataSource.getRepository(DynamicRate);
const subsidyRepository = AppDataSource.getRepository(DynamicSubsidy);
const configRepository = AppDataSource.getRepository(Config);

const offerService = new OfferService();
const configService = new ConfigService();

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
    const data: UpdateBankDTO = req.body; // 👈 Используем DTO
    console.log(`📝 Updating bank ${id} with data:`, data);

    const existingBank = await bankRepository.findOne({
      where: { id },
    });

    if (!existingBank) {
      console.log(`⚠️ Bank not found: ${id}`);
      return res.status(404).json({ error: "Bank not found" });
    }

    // Обновляем только поля из DTO
    if (data.name !== undefined) existingBank.name = data.name;
    if (data.baseRate !== undefined) existingBank.baseRate = data.baseRate;
    if (data.minPVPercent !== undefined)
      existingBank.minPVPercent = data.minPVPercent;
    if (data.displayOrder !== undefined)
      existingBank.displayOrder = data.displayOrder;
    if (data.isActive !== undefined) existingBank.isActive = data.isActive;

    // Если изменилось имя, обновляем slug
    if (data.name && data.name !== existingBank.name) {
      const generateSlug = (await import("../utils/slugify")).generateSlug;
      existingBank.slug = generateSlug(data.name);
    }

    // ✅ TypeORM автоматически обновит updatedAt благодаря @UpdateDateColumn()
    await bankRepository.save(existingBank);
    console.log("✅ Bank updated:", existingBank);
    res.json(existingBank);
  } catch (error) {
    console.error("Error updating bank:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to update bank",
    });
  }
};

export const createBank = async (req: Request, res: Response) => {
  try {
    const data: CreateBankDTO = req.body;
    console.log("📝 Creating bank with data:", data);

    const bank = bankRepository.create(data);
    await bankRepository.save(bank);

    console.log("✅ Bank created:", bank);
    res.status(201).json(bank);
  } catch (error) {
    console.error("Error creating bank:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create bank",
    });
  }
};

export const deleteBank = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting bank ${id}`);

    const result = await bankRepository.delete(id);

    if (result.affected === 0) {
      return res.status(404).json({ error: "Bank not found" });
    }

    console.log("✅ Bank deleted");
    res.json({ success: true, message: "Bank deleted successfully" });
  } catch (error) {
    console.error("Error deleting bank:", error);
    res.status(500).json({ error: "Failed to delete bank" });
  }
};

// ============================================================
// 🔥 ЖК (КОМПЛЕКСЫ)
// ============================================================
export const getComplexes = async (req: Request, res: Response) => {
  try {
    const complexes = await complexRepository.find({
      relations: ["apartmentTypes"],
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
    const updated = await complexRepository.findOne({
      where: { id },
      relations: ["apartmentTypes"],
    });
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
// 🔥 ТИПЫ КВАРТИР
// ============================================================

export const getApartmentTypes = async (req: Request, res: Response) => {
  try {
    const { complexId } = req.params;
    const types = await apartmentTypeRepository.find({
      where: { complexId },
      order: { type: "ASC" },
    });
    res.json(types);
  } catch (error) {
    console.error("Error getting apartment types:", error);
    res.status(500).json({ error: "Failed to get apartment types" });
  }
};

export const createApartmentType = async (req: Request, res: Response) => {
  try {
    const { complexId } = req.params;
    const data = req.body;

    const complex = await complexRepository.findOne({
      where: { id: complexId },
    });

    if (!complex) {
      return res.status(404).json({ error: "Complex not found" });
    }

    const apartmentType = apartmentTypeRepository.create({
      ...data,
      complexId,
    });

    await apartmentTypeRepository.save(apartmentType);
    res.status(201).json(apartmentType);
  } catch (error) {
    console.error("Error creating apartment type:", error);
    res.status(500).json({ error: "Failed to create apartment type" });
  }
};

export const updateApartmentType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    await apartmentTypeRepository.update(id, data);
    const updated = await apartmentTypeRepository.findOneBy({ id });
    res.json(updated);
  } catch (error) {
    console.error("Error updating apartment type:", error);
    res.status(500).json({ error: "Failed to update apartment type" });
  }
};

export const deleteApartmentType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await apartmentTypeRepository.delete(id);
    res.json({ success: true, message: "Apartment type deleted" });
  } catch (error) {
    console.error("Error deleting apartment type:", error);
    res.status(500).json({ error: "Failed to delete apartment type" });
  }
};

// ============================================================
// 🔥 ПРОГРАММЫ - ПОЛНЫЙ CRUD
// ============================================================

export const getPrograms = async (req: Request, res: Response) => {
  try {
    const programs = await programRepository.find({
      order: { displayOrder: "ASC" },
    });
    res.json(programs);
  } catch (error) {
    console.error("Error getting programs:", error);
    res.status(500).json({ error: "Failed to get programs" });
  }
};

export const createProgram = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    console.log("📝 Creating program with data:", data);

    // Проверяем обязательные поля
    if (!data.type) {
      return res.status(400).json({ error: "Program type is required" });
    }
    if (!data.label) {
      return res.status(400).json({ error: "Program label is required" });
    }

    const program = programRepository.create({
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    await programRepository.save(program);
    console.log("✅ Program created:", program);
    res.status(201).json(program);
  } catch (error) {
    console.error("Error creating program:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to create program",
    });
  }
};

export const updateProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    console.log(`📝 Updating program ${id} with data:`, data);

    const existingProgram = await programRepository.findOne({
      where: { id },
    });

    if (!existingProgram) {
      return res.status(404).json({ error: "Program not found" });
    }

    // Обновляем поля
    if (data.type !== undefined) existingProgram.type = data.type;
    if (data.label !== undefined) existingProgram.label = data.label;
    if (data.icon !== undefined) existingProgram.icon = data.icon;
    if (data.color !== undefined) existingProgram.color = data.color;
    if (data.description !== undefined)
      existingProgram.description = data.description;
    if (data.displayOrder !== undefined)
      existingProgram.displayOrder = data.displayOrder;
    if (data.isActive !== undefined) existingProgram.isActive = data.isActive;

    await programRepository.save(existingProgram);
    console.log("✅ Program updated:", existingProgram);
    res.json(existingProgram);
  } catch (error) {
    console.error("Error updating program:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to update program",
    });
  }
};

export const deleteProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting program ${id}`);

    const result = await programRepository.delete(id);

    if (result.affected === 0) {
      return res.status(404).json({ error: "Program not found" });
    }

    console.log("✅ Program deleted");
    res.json({ success: true, message: "Program deleted successfully" });
  } catch (error) {
    console.error("Error deleting program:", error);
    res.status(500).json({ error: "Failed to delete program" });
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
    const config = await configService.getConfig();
    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error getting config:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get config",
    });
  }
};

export const updateConfig = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    console.log("📝 Updating config with data:", data);

    // Валидация
    if (!data || typeof data !== "object") {
      return res.status(400).json({
        success: false,
        error: "Invalid config data",
      });
    }

    const config = await configService.updateConfig(data);
    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("❌ Error updating config:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update config",
    });
  }
};

// ============================================================
// 🔥 ОФФЕРЫ - ПОЛНЫЙ CRUD
// ============================================================

/**
 * Получить все офферы (для админки)
 */
export const getOffers = async (req: Request, res: Response) => {
  try {
    const offers = await offerService.getAllOffersAdmin();
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

/**
 * Получить активные офферы
 */
export const getActiveOffers = async (req: Request, res: Response) => {
  try {
    const offers = await offerService.getAllOffers();
    res.json({
      success: true,
      data: offers,
    });
  } catch (error) {
    console.error("Error getting active offers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get active offers",
    });
  }
};

/**
 * Получить оффер по ID
 */
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

/**
 * Создать оффер
 */
export const createOffer = async (req: Request, res: Response) => {
  try {
    const data: CreateOfferDTO = req.body;
    console.log("📝 Creating offer with data:", data);

    const offer = await offerService.createOffer(data);
    console.log("✅ Offer created:", offer.id);

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

/**
 * Обновить оффер
 */
export const updateOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateOfferDTO = { id, ...req.body };
    console.log(`📝 Updating offer ${id} with data:`, data);

    const offer = await offerService.updateOffer(id, data);
    console.log("✅ Offer updated:", offer.id);

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

/**
 * Мягкое удаление оффера
 */
export const deleteOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Soft deleting offer ${id}`);

    await offerService.deleteOffer(id);
    console.log("✅ Offer soft deleted");

    res.json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting offer:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete offer",
    });
  }
};

/**
 * Восстановить оффер
 */
export const restoreOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🔄 Restoring offer ${id}`);

    await offerService.restoreOffer(id);
    console.log("✅ Offer restored");

    res.json({
      success: true,
      message: "Offer restored successfully",
    });
  } catch (error) {
    console.error("Error restoring offer:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to restore offer",
    });
  }
};

/**
 * Полное удаление оффера (hard delete)
 */
export const hardDeleteOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Hard deleting offer ${id}`);

    await offerService.hardDeleteOffer(id);
    console.log("✅ Offer hard deleted");

    res.json({
      success: true,
      message: "Offer permanently deleted",
    });
  } catch (error) {
    console.error("Error hard deleting offer:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete offer",
    });
  }
};

/**
 * Копировать оффер
 */
export const copyOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`📋 Copying offer ${id}`);

    const copy = await offerService.copyOffer(id);
    console.log("✅ Offer copied:", copy.id);

    res.status(201).json({
      success: true,
      data: copy,
      message: "Offer copied successfully",
    });
  } catch (error) {
    console.error("Error copying offer:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to copy offer",
    });
  }
};

/**
 * Получить офферы с фильтрацией
 */
export const getOffersFiltered = async (req: Request, res: Response) => {
  try {
    const filters = req.query;
    console.log("🔍 Filtering offers with:", filters);

    const offers = await offerService.getOffersFiltered({
      bankId: filters.bankId as string,
      programId: filters.programId as string,
      programType: filters.programType as string,
      complexName: filters.complexName as string,
      isActive: filters.isActive ? filters.isActive === "true" : undefined,
      minRate: filters.minRate
        ? parseFloat(filters.minRate as string)
        : undefined,
      maxRate: filters.maxRate
        ? parseFloat(filters.maxRate as string)
        : undefined,
      minPVPercent: filters.minPVPercent
        ? parseFloat(filters.minPVPercent as string)
        : undefined,
      maxPVPercent: filters.maxPVPercent
        ? parseFloat(filters.maxPVPercent as string)
        : undefined,
      search: filters.search as string,
    });

    res.json({
      success: true,
      data: offers,
      count: offers.length,
    });
  } catch (error) {
    console.error("Error filtering offers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to filter offers",
    });
  }
};

/**
 * Получить диапазон ставок
 */
export const getRateRange = async (req: Request, res: Response) => {
  try {
    const { bankId, programId, complexName } = req.query;

    const range = await offerService.getRateRange({
      bankId: bankId as string,
      programId: programId as string,
      complexName: complexName as string,
    });

    res.json({
      success: true,
      data: range,
    });
  } catch (error) {
    console.error("Error getting rate range:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get rate range",
    });
  }
};

// ============================================================
// 🔥 ДИНАМИЧЕСКИЕ СТАВКИ
// ============================================================

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
// 🔥 ДИНАМИЧЕСКИЕ СУБСИДИИ
// ============================================================

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
