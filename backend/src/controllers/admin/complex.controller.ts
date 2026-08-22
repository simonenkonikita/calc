// backend/src/controllers/admin/complex.controller.ts

import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Complex } from "../../entities/Complex";
import { BaseController } from "./base.controller";

const complexRepository = AppDataSource.getRepository(Complex);

export class ComplexController extends BaseController {
  /**
   * Получить все ЖК
   */
  async getAll(req: Request, res: Response) {
    try {
      const complexes = await complexRepository.find({
        relations: ["apartmentTypes"],
        order: { name: "ASC" },
      });
      res.json(complexes);
    } catch (error) {
      this.handleError(res, error, "Failed to get complexes");
    }
  }

  /**
   * Получить ЖК по ID
   */
  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const complex = await complexRepository.findOne({
        where: { id },
        relations: ["apartmentTypes"],
      });

      if (!complex) {
        return this.handleNotFound(res, "Complex");
      }

      res.json(complex);
    } catch (error) {
      this.handleError(res, error, "Failed to get complex");
    }
  }

  /**
   * Создать ЖК
   */
  async create(req: Request, res: Response) {
    try {
      const data = req.body;
      console.log(
        "📝 Creating complex with data:",
        JSON.stringify(data, null, 2),
      );

      // Валидация обязательных полей
      if (!data.name) {
        console.log("❌ Validation failed: name is required");
        return res.status(400).json({
          success: false,
          error: "Name is required",
        });
      }

      if (!data.status) {
        console.log("❌ Validation failed: status is required");
        return res.status(400).json({
          success: false,
          error: "Status is required",
        });
      }

      // Генерируем slug из названия
      const { generateSlug } = await import("../../utils/slugify");
      const slug = generateSlug(data.name);
      console.log(`🔗 Generated slug: ${slug}`);

      // Проверяем, существует ли ЖК с таким именем
      const existing = await complexRepository.findOne({
        where: { name: data.name },
      });

      if (existing) {
        console.log(`❌ Complex with name "${data.name}" already exists`);
        return res.status(409).json({
          success: false,
          error: `Complex with name "${data.name}" already exists`,
        });
      }

      // Создаем комплекс
      const complex = complexRepository.create({
        name: data.name,
        slug: slug,
        status: data.status,
        description: data.description || "",
        banks: data.banks || [],
        paymentTerms: data.paymentTerms || [],
        promotions: data.promotions || [],
        specialOffers: data.specialOffers || [],
        materialsLink: data.materialsLink || "",
        isActive: data.isActive !== undefined ? data.isActive : true,
      });

      console.log("🏗️ Saving complex to database...");
      await complexRepository.save(complex);
      console.log("✅ Complex saved successfully:", complex.id);

      // Возвращаем созданный комплекс с отношениями
      const created = await complexRepository.findOne({
        where: { id: complex.id },
        relations: ["apartmentTypes"],
      });

      res.status(201).json(created);
    } catch (error) {
      console.error("❌ Error creating complex - FULL ERROR:", error);
      // Исправляем: проверяем тип error перед использованием stack
      if (error instanceof Error) {
        console.error("❌ Error stack:", error.stack);
      }

      // Отправляем детальную ошибку
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create complex";
      const errorStack = error instanceof Error ? error.stack : undefined;

      res.status(500).json({
        success: false,
        error: errorMessage,
        ...(process.env.NODE_ENV === "development" && { stack: errorStack }),
      });
    }
  }

  /**
   * Обновить ЖК
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      console.log(`📝 Updating complex ${id} with data:`, data);

      const existingComplex = await complexRepository.findOne({
        where: { id },
        relations: ["apartmentTypes"],
      });

      if (!existingComplex) {
        return this.handleNotFound(res, "Complex");
      }

      // Обновляем поля
      if (data.name !== undefined) existingComplex.name = data.name;
      if (data.status !== undefined) existingComplex.status = data.status;
      if (data.description !== undefined)
        existingComplex.description = data.description;
      if (data.banks !== undefined) existingComplex.banks = data.banks;
      if (data.paymentTerms !== undefined)
        existingComplex.paymentTerms = data.paymentTerms;
      if (data.promotions !== undefined)
        existingComplex.promotions = data.promotions;
      if (data.specialOffers !== undefined)
        existingComplex.specialOffers = data.specialOffers;
      if (data.materialsLink !== undefined)
        existingComplex.materialsLink = data.materialsLink;
      if (data.isActive !== undefined) existingComplex.isActive = data.isActive;

      // Если изменилось имя, обновляем slug
      if (data.name && data.name !== existingComplex.name) {
        const { generateSlug } = await import("../../utils/slugify");
        existingComplex.slug = generateSlug(data.name);
      }

      await complexRepository.save(existingComplex);
      console.log("✅ Complex updated:", existingComplex);

      // Возвращаем обновленный комплекс с отношениями
      const updated = await complexRepository.findOne({
        where: { id },
        relations: ["apartmentTypes"],
      });

      res.json(updated);
    } catch (error) {
      console.error("❌ Error updating complex:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update complex";
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Удалить ЖК
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log(`🗑️ Deleting complex ${id}`);

      const result = await complexRepository.delete(id);

      if (result.affected === 0) {
        return this.handleNotFound(res, "Complex");
      }

      console.log("✅ Complex deleted");
      res.json({ success: true, message: "Complex deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting complex:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete complex";
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  }
}

export const complexController = new ComplexController();
