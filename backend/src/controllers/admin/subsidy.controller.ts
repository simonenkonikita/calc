// backend/src/controllers/admin/subsidy.controller.ts

import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { DynamicSubsidy } from "../../entities/DynamicSubsidy";
import { Offer } from "../../entities/Offer";
import { BaseController } from "./base.controller";

const subsidyRepository = AppDataSource.getRepository(DynamicSubsidy);
const offerRepository = AppDataSource.getRepository(Offer);

export class SubsidyController extends BaseController {
  /**
   * Получить все динамические субсидии
   */
  async getAll(req: Request, res: Response) {
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
      this.handleError(res, error, "Failed to get dynamic subsidies");
    }
  }

  /**
   * Получить субсидии по офферу
   */
  async getByOffer(req: Request, res: Response) {
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
      this.handleError(res, error, "Failed to get dynamic subsidies by offer");
    }
  }

  /**
   * Получить субсидию по ID
   */
  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const subsidy = await subsidyRepository.findOne({
        where: { id },
        relations: ["offer", "offer.bank"],
      });

      if (!subsidy) {
        return this.handleNotFound(res, "Dynamic subsidy");
      }

      res.json({
        success: true,
        data: subsidy,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to get dynamic subsidy");
    }
  }

  /**
   * Создать динамическую субсидию
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

      // 🔥 Создаем субсидию с новыми полями
      const subsidy = subsidyRepository.create({
        conditionType: data.conditionType || "pv",
        condition: data.condition || "gte",
        value: data.value !== undefined ? data.value : null,
        minValue: data.minValue !== undefined ? data.minValue : null,
        maxValue: data.maxValue !== undefined ? data.maxValue : null,
        rate: data.rate || 0,
        priority: data.priority || 0,
        description: data.description || "",
        conditionMetadata: data.conditionMetadata || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        offerId: offerId,
      });

      await subsidyRepository.save(subsidy);

      // Возвращаем созданную субсидию с отношениями
      const created = await subsidyRepository.findOne({
        where: { id: subsidy.id },
        relations: ["offer", "offer.bank"],
      });

      res.status(201).json({
        success: true,
        data: created,
      });
    } catch (error) {
      console.error("❌ Error creating dynamic subsidy:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create dynamic subsidy",
      });
    }
  }

  /**
   * Обновить динамическую субсидию
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = this.cleanData(req.body);

      const subsidy = await subsidyRepository.findOne({
        where: { id },
      });

      if (!subsidy) {
        return this.handleNotFound(res, "Dynamic subsidy");
      }

      // 🔥 Обновляем только переданные поля (новые)
      if (data.conditionType !== undefined) {
        subsidy.conditionType = data.conditionType;
      }
      if (data.condition !== undefined) {
        subsidy.condition = data.condition;
      }
      if (data.value !== undefined) {
        subsidy.value = data.value;
      }
      if (data.minValue !== undefined) {
        subsidy.minValue = data.minValue;
      }
      if (data.maxValue !== undefined) {
        subsidy.maxValue = data.maxValue;
      }
      if (data.rate !== undefined) {
        subsidy.rate = data.rate;
      }
      if (data.priority !== undefined) {
        subsidy.priority = data.priority;
      }
      if (data.description !== undefined) {
        subsidy.description = data.description;
      }
      if (data.conditionMetadata !== undefined) {
        subsidy.conditionMetadata = data.conditionMetadata;
      }
      if (data.isActive !== undefined) {
        subsidy.isActive = data.isActive;
      }

      await subsidyRepository.save(subsidy);

      const updated = await subsidyRepository.findOne({
        where: { id },
        relations: ["offer", "offer.bank"],
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to update dynamic subsidy");
    }
  }

  /**
   * Удалить динамическую субсидию (мягкое удаление)
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await subsidyRepository.update(id, { isActive: false });

      res.json({
        success: true,
        message: "Dynamic subsidy deleted successfully",
      });
    } catch (error) {
      this.handleError(res, error, "Failed to delete dynamic subsidy");
    }
  }

  /**
   * Полностью удалить динамическую субсидию
   */
  async hardDelete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const subsidy = await subsidyRepository.findOne({
        where: { id },
      });

      if (!subsidy) {
        return this.handleNotFound(res, "Dynamic subsidy");
      }

      await subsidyRepository.delete(id);

      res.json({
        success: true,
        message: "Dynamic subsidy permanently deleted",
      });
    } catch (error) {
      this.handleError(res, error, "Failed to hard delete dynamic subsidy");
    }
  }

  /**
   * Массовое обновление приоритетов
   */
  async updatePriorities(req: Request, res: Response) {
    try {
      const { subsidies } = req.body;

      if (!Array.isArray(subsidies)) {
        return res.status(400).json({
          success: false,
          error: "Subsidies must be an array",
        });
      }

      for (const subsidyData of subsidies) {
        if (subsidyData.id && subsidyData.priority !== undefined) {
          await subsidyRepository.update(subsidyData.id, {
            priority: subsidyData.priority,
          });
        }
      }

      const updated = await subsidyRepository.find({
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

  /**
   * Копировать субсидии из одного оффера в другой
   */
  async copyFromOffer(req: Request, res: Response) {
    try {
      const { sourceOfferId, targetOfferId } = req.body;

      if (!sourceOfferId || !targetOfferId) {
        return res.status(400).json({
          success: false,
          error: "sourceOfferId and targetOfferId are required",
        });
      }

      // Проверяем, что оба оффера существуют
      const [sourceOffer, targetOffer] = await Promise.all([
        offerRepository.findOne({ where: { id: sourceOfferId } }),
        offerRepository.findOne({ where: { id: targetOfferId } }),
      ]);

      if (!sourceOffer) {
        return res.status(404).json({
          success: false,
          error: "Source offer not found",
        });
      }

      if (!targetOffer) {
        return res.status(404).json({
          success: false,
          error: "Target offer not found",
        });
      }

      // Получаем субсидии из источника
      const sourceSubsidies = await subsidyRepository.find({
        where: { offerId: sourceOfferId, isActive: true },
      });

      if (sourceSubsidies.length === 0) {
        return res.json({
          success: true,
          data: [],
          message: "No subsidies to copy from source offer",
        });
      }

      // Копируем субсидии
      const copied = [];
      for (const subsidy of sourceSubsidies) {
        // 🔥 Создаем новый объект субсидии с новыми полями
        const subsidyData = {
          conditionType: subsidy.conditionType,
          condition: subsidy.condition,
          value: subsidy.value,
          minValue: subsidy.minValue,
          maxValue: subsidy.maxValue,
          rate: subsidy.rate,
          priority: subsidy.priority,
          description: subsidy.description,
          conditionMetadata: subsidy.conditionMetadata,
          isActive: subsidy.isActive,
          offerId: targetOfferId,
        };

        const newSubsidy = subsidyRepository.create(subsidyData);
        await subsidyRepository.save(newSubsidy);
        copied.push(newSubsidy);
      }

      // Загружаем созданные субсидии с отношениями
      const createdSubsidies = await subsidyRepository.find({
        where: { offerId: targetOfferId, isActive: true },
        relations: ["offer", "offer.bank"],
        order: { priority: "ASC" },
      });

      res.json({
        success: true,
        data: createdSubsidies,
        message: `Copied ${copied.length} subsidies from ${sourceOfferId} to ${targetOfferId}`,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to copy subsidies");
    }
  }

  /**
   * Получить статистику по субсидиям
   */
  async getStats(req: Request, res: Response) {
    try {
      const total = await subsidyRepository.count();
      const active = await subsidyRepository.count({
        where: { isActive: true },
      });
      const byOffer = await subsidyRepository
        .createQueryBuilder("subsidy")
        .select("subsidy.offerId", "offerId")
        .addSelect("COUNT(*)", "count")
        .groupBy("subsidy.offerId")
        .getRawMany();

      res.json({
        success: true,
        data: {
          total,
          active,
          inactive: total - active,
          byOffer,
        },
      });
    } catch (error) {
      this.handleError(res, error, "Failed to get subsidies stats");
    }
  }

  /**
   * Удалить все субсидии для оффера
   */
  async deleteByOffer(req: Request, res: Response) {
    try {
      const { offerId } = req.params;

      const offer = await offerRepository.findOne({
        where: { id: offerId },
      });

      if (!offer) {
        return this.handleNotFound(res, "Offer");
      }

      const result = await subsidyRepository.update(
        { offerId, isActive: true },
        { isActive: false },
      );

      res.json({
        success: true,
        message: `Deactivated ${result.affected || 0} subsidies for offer ${offerId}`,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to delete subsidies by offer");
    }
  }
}

export const subsidyController = new SubsidyController();
