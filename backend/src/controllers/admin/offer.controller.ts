// backend/src/controllers/admin/offer.controller.ts

import { Request, Response } from "express";
import { OfferService } from "../../services/OfferService";
import { CreateOfferDTO, UpdateOfferDTO } from "../../dtos/OfferDto";
import { BaseController } from "./base.controller";
// 🔥 Добавляем импорты для работы с БД
import { AppDataSource } from "../../data-source";
import { DynamicRate } from "../../entities/DynamicRate";
import { DynamicSubsidy } from "../../entities/DynamicSubsidy";

const offerService = new OfferService();

export class OfferController extends BaseController {
  /**
   * Получить все офферы (для админки)
   */
  async getAll(req: Request, res: Response) {
    try {
      const offers = await offerService.getAllOffersAdmin();
      res.json({
        success: true,
        data: offers,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to get offers");
    }
  }

  /**
   * Получить активные офферы
   */
  async getActive(req: Request, res: Response) {
    try {
      const offers = await offerService.getAllOffers();
      res.json({
        success: true,
        data: offers,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to get active offers");
    }
  }

  /**
   * Получить оффер по ID
   */
  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const offer = await offerService.getOfferById(id);

      if (!offer) {
        return this.handleNotFound(res, "Offer");
      }

      res.json({
        success: true,
        data: offer,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to get offer");
    }
  }

  /**
   * Создать оффер
   */
  async create(req: Request, res: Response) {
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
      this.handleError(res, error, "Failed to create offer");
    }
  }

  /**
   * Обновить оффер
   */
  async update(req: Request, res: Response) {
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
      this.handleError(res, error, "Failed to update offer");
    }
  }

  /**
   * Мягкое удаление оффера
   */
  async delete(req: Request, res: Response) {
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
      this.handleError(res, error, "Failed to delete offer");
    }
  }

  /**
   * Восстановить оффер
   */
  async restore(req: Request, res: Response) {
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
      this.handleError(res, error, "Failed to restore offer");
    }
  }

  /**
   * Полное удаление оффера (hard delete)
   * 🔥 Удаляем все связанные записи перед удалением оффера
   */
  async hardDelete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log(`🗑️ Hard deleting offer ${id}`);

      // 🔥 Проверяем, существует ли оффер
      const offer = await offerService.getOfferById(id);
      if (!offer) {
        return this.handleNotFound(res, "Offer");
      }

      // 🔥 Получаем репозитории
      const rateRepository = AppDataSource.getRepository(DynamicRate);
      const subsidyRepository = AppDataSource.getRepository(DynamicSubsidy);

      // 🔥 1. Удаляем все связанные динамические ставки
      const rates = await rateRepository.find({ where: { offerId: id } });
      console.log(`📊 Found ${rates.length} rates to delete`);
      for (const rate of rates) {
        await rateRepository.delete(rate.id);
        console.log(`🗑️ Deleted rate ${rate.id}`);
      }

      // 🔥 2. Удаляем все связанные динамические субсидии
      const subsidies = await subsidyRepository.find({
        where: { offerId: id },
      });
      console.log(`📊 Found ${subsidies.length} subsidies to delete`);
      for (const subsidy of subsidies) {
        await subsidyRepository.delete(subsidy.id);
        console.log(`🗑️ Deleted subsidy ${subsidy.id}`);
      }

      // 🔥 3. Теперь удаляем сам оффер (hard delete)
      await offerService.hardDeleteOffer(id);
      console.log("✅ Offer hard deleted");

      res.json({
        success: true,
        message: "Offer permanently deleted",
      });
    } catch (error) {
      console.error("❌ Error hard deleting offer:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to hard delete offer",
      });
    }
  }

  /**
   * Копировать оффер
   */
  async copy(req: Request, res: Response) {
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
      this.handleError(res, error, "Failed to copy offer");
    }
  }

  /**
   * Получить офферы с фильтрацией
   */
  async getFiltered(req: Request, res: Response) {
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
      this.handleError(res, error, "Failed to filter offers");
    }
  }

  /**
   * Получить диапазон ставок
   */
  async getRateRange(req: Request, res: Response) {
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
      this.handleError(res, error, "Failed to get rate range");
    }
  }
}

export const offerController = new OfferController();
