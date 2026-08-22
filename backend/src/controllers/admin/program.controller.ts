// backend/src/controllers/admin/program.controller.ts

import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Program } from "../../entities/Program";
import { Offer } from "../../entities/Offer";
import { BaseController } from "./base.controller";
import { CreateProgramDTO, UpdateProgramDTO } from "../../dtos/ProgramDto";

const programRepository = AppDataSource.getRepository(Program);
const offerRepository = AppDataSource.getRepository(Offer);

export class ProgramController extends BaseController {
  /**
   * Получить все программы
   */
  async getAll(req: Request, res: Response) {
    try {
      const programs = await programRepository.find({
        order: { displayOrder: "ASC" },
      });
      res.json(programs);
    } catch (error) {
      this.handleError(res, error, "Failed to get programs");
    }
  }

  /**
   * Получить программу по ID
   */
  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const program = await programRepository.findOne({
        where: { id },
        relations: ["offers", "offers.bank"],
      });

      if (!program) {
        return this.handleNotFound(res, "Program");
      }

      res.json(program);
    } catch (error) {
      this.handleError(res, error, "Failed to get program");
    }
  }

  /**
   * Создать программу
   */
  async create(req: Request, res: Response) {
    try {
      const data: CreateProgramDTO = req.body;
      console.log("📝 Creating program with data:", data);

      if (!data.type) {
        return res.status(400).json({
          success: false,
          error: "Program type is required",
        });
      }
      if (!data.label) {
        return res.status(400).json({
          success: false,
          error: "Program label is required",
        });
      }

      const existing = await programRepository.findOne({
        where: { type: data.type },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          error: `Program with type "${data.type}" already exists`,
        });
      }

      const program = programRepository.create({
        type: data.type,
        label: data.label,
        icon: data.icon || "🏦",
        color: data.color || "#6b7280",
        description: data.description || "",
        displayOrder: data.displayOrder !== undefined ? data.displayOrder : 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      });

      await programRepository.save(program);
      console.log("✅ Program created:", program);
      res.status(201).json(program);
    } catch (error) {
      this.handleError(res, error, "Failed to create program");
    }
  }

  /**
   * Обновить программу
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // 🔥 Очищаем данные от системных полей
      const rawData = req.body;
      const data: UpdateProgramDTO = {};

      if (rawData.type !== undefined) data.type = rawData.type;
      if (rawData.label !== undefined) data.label = rawData.label;
      if (rawData.icon !== undefined) data.icon = rawData.icon;
      if (rawData.color !== undefined) data.color = rawData.color;
      if (rawData.description !== undefined)
        data.description = rawData.description;
      if (rawData.displayOrder !== undefined)
        data.displayOrder = rawData.displayOrder;
      if (rawData.isActive !== undefined) data.isActive = rawData.isActive;

      console.log(`📝 Updating program ${id} with data:`, data);

      // 🔥 НЕ загружаем offers, чтобы избежать проблем с OneToMany
      const existingProgram = await programRepository.findOne({
        where: { id },
        // ❌ Убираем relations: ["offers"]
      });

      if (!existingProgram) {
        return this.handleNotFound(res, "Program");
      }

      if (data.type && data.type !== existingProgram.type) {
        const existing = await programRepository.findOne({
          where: { type: data.type },
        });
        if (existing) {
          return res.status(409).json({
            success: false,
            error: `Program with type "${data.type}" already exists`,
          });
        }
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

      // 🔥 Сохраняем без связанных сущностей
      await programRepository.save(existingProgram);
      console.log("✅ Program updated:", existingProgram);

      // 🔥 Возвращаем обновленную программу (без offers)
      res.json(existingProgram);
    } catch (error) {
      console.error("❌ Error updating program:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update program",
      });
    }
  }

  /**
   * Удалить программу со всеми связанными офферами (каскадное удаление)
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { cascade } = req.query;
      console.log(`🗑️ Deleting program ${id}, cascade: ${cascade}`);

      const program = await programRepository.findOne({
        where: { id },
        // ❌ Убираем relations: ["offers"] чтобы избежать проблем
      });

      if (!program) {
        return this.handleNotFound(res, "Program");
      }

      const offersCount = await offerRepository.count({
        where: { programId: id },
      });

      if (offersCount > 0 && cascade !== "true") {
        return res.status(409).json({
          success: false,
          error: `Cannot delete program with ${offersCount} associated offers. Use ?cascade=true to delete all associated offers.`,
          offersCount,
          canCascade: true,
        });
      }

      if (cascade === "true" && offersCount > 0) {
        console.log(
          `🗑️ Deleting ${offersCount} associated offers for program ${id}`,
        );
        await offerRepository.delete({ programId: id });
        console.log("✅ Associated offers deleted");
      }

      const result = await programRepository.delete(id);

      if (result.affected === 0) {
        return this.handleNotFound(res, "Program");
      }

      console.log(`✅ Program deleted with ${offersCount} offers`);
      res.json({
        success: true,
        message: `Program and ${offersCount} associated offers deleted successfully`,
        offersDeleted: offersCount,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to delete program");
    }
  }

  /**
   * Получить статистику по программам
   */
  async getStats(req: Request, res: Response) {
    try {
      const total = await programRepository.count();
      const active = await programRepository.count({
        where: { isActive: true },
      });
      const inactive = total - active;

      const byType = await programRepository
        .createQueryBuilder("program")
        .select("program.type", "type")
        .addSelect("COUNT(*)", "count")
        .groupBy("program.type")
        .getRawMany();

      res.json({
        success: true,
        data: {
          total,
          active,
          inactive,
          byType,
        },
      });
    } catch (error) {
      this.handleError(res, error, "Failed to get programs stats");
    }
  }
}

export const programController = new ProgramController();
