// backend/src/controllers/admin/rate.controller.ts

import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { DynamicRate } from "../../entities/DynamicRate";
import { Offer } from "../../entities/Offer";
import { BaseController } from "./base.controller";

const rateRepository = AppDataSource.getRepository(DynamicRate);
const offerRepository = AppDataSource.getRepository(Offer);

export class RateController extends BaseController {
  /**
   * Получить все динамические ставки
   */
  async getAll(req: Request, res: Response) {
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
      this.handleError(res, error, "Failed to get dynamic rates");
    }
  }

  /**
   * Получить ставки по офферу
   */
  async getByOffer(req: Request, res: Response) {
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
      this.handleError(res, error, "Failed to get dynamic rates by offer");
    }
  }

  /**
   * Получить ставку по ID
   */
  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const rate = await rateRepository.findOne({
        where: { id },
        relations: ["offer", "offer.bank"],
      });

      if (!rate) {
        return this.handleNotFound(res, "Dynamic rate");
      }

      res.json({
        success: true,
        data: rate,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to get dynamic rate");
    }
  }

  /**
   * Создать динамическую ставку
   */
  async create(req: Request, res: Response) {
    try {
      const { offerId } = req.params;
      const data = this.cleanData(req.body);

      // Проверяем существование оффера
      const offer = await offerRepository.findOne({
        where: { id: offerId },
      });

      if (!offer) {
        return this.handleNotFound(res, "Offer");
      }

      // Создаем ставку
      const rate = rateRepository.create({
        conditionType: data.conditionType || "pv",
        condition: data.condition || "gte",
        value: data.value || null,
        minValue: data.minValue || null,
        maxValue: data.maxValue || null,
        conditionMetadata: data.conditionMetadata || null,
        rate: data.rate || 0,
        priority: data.priority || 0,
        description: data.description || "",
        isActive: data.isActive !== undefined ? data.isActive : true,
        offerId: offerId,
      });

      await rateRepository.save(rate);

      // Возвращаем созданную ставку с отношениями
      const created = await rateRepository.findOne({
        where: { id: rate.id },
        relations: ["offer", "offer.bank"],
      });

      res.status(201).json({
        success: true,
        data: created,
      });
    } catch (error) {
      console.error("❌ Error creating dynamic rate:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create dynamic rate",
      });
    }
  }

  /**
   * Обновить динамическую ставку
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = this.cleanData(req.body);

      const rate = await rateRepository.findOne({
        where: { id },
      });

      if (!rate) {
        return this.handleNotFound(res, "Dynamic rate");
      }

      // Обновляем только переданные поля
      if (data.conditionType !== undefined)
        rate.conditionType = data.conditionType;
      if (data.condition !== undefined) rate.condition = data.condition;
      if (data.value !== undefined) rate.value = data.value;
      if (data.minValue !== undefined) rate.minValue = data.minValue;
      if (data.maxValue !== undefined) rate.maxValue = data.maxValue;
      if (data.conditionMetadata !== undefined)
        rate.conditionMetadata = data.conditionMetadata;
      if (data.rate !== undefined) rate.rate = data.rate;
      if (data.priority !== undefined) rate.priority = data.priority;
      if (data.description !== undefined) rate.description = data.description;
      if (data.isActive !== undefined) rate.isActive = data.isActive;

      await rateRepository.save(rate);

      const updated = await rateRepository.findOne({
        where: { id },
        relations: ["offer", "offer.bank"],
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to update dynamic rate");
    }
  }

  /**
   * Удалить динамическую ставку (мягкое удаление)
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await rateRepository.update(id, { isActive: false });

      res.json({
        success: true,
        message: "Dynamic rate deleted successfully",
      });
    } catch (error) {
      this.handleError(res, error, "Failed to delete dynamic rate");
    }
  }

  /**
   * Полностью удалить динамическую ставку
   */
  async hardDelete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const rate = await rateRepository.findOne({
        where: { id },
      });

      if (!rate) {
        return this.handleNotFound(res, "Dynamic rate");
      }

      await rateRepository.delete(id);

      res.json({
        success: true,
        message: "Dynamic rate permanently deleted",
      });
    } catch (error) {
      this.handleError(res, error, "Failed to hard delete dynamic rate");
    }
  }

  /**
   * Массовое обновление приоритетов
   */
  async updatePriorities(req: Request, res: Response) {
    try {
      const { rates } = req.body;

      if (!Array.isArray(rates)) {
        return res.status(400).json({
          success: false,
          error: "Rates must be an array",
        });
      }

      for (const rateData of rates) {
        if (rateData.id && rateData.priority !== undefined) {
          await rateRepository.update(rateData.id, {
            priority: rateData.priority,
          });
        }
      }

      const updated = await rateRepository.find({
        relations: ["offer", "offer.bank"],
        where: { isActive: true },
        order: { priority: "ASC" },
      });

      res.json({
        success: true,
        data: updated,
        message: "Priorities updated successfully",
      });
    } catch (error) {
      this.handleError(res, error, "Failed to update priorities");
    }
  }
}

export const rateController = new RateController();
