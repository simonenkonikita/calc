// backend/src/controllers/admin/complex.controller.ts

import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Complex } from "../../entities/Complex";
import { ApartmentType } from "../../entities/ApartmentType";
import { BaseController } from "./base.controller";
import { AuthRequest } from "../../types/auth.types";
import { ComplexService } from "../../services/ComplexService";

const complexRepository = AppDataSource.getRepository(Complex);
const apartmentTypeRepository = AppDataSource.getRepository(ApartmentType);
const complexService = new ComplexService();

export class ComplexController extends BaseController {
  /**
   * Получить все ЖК (с учетом прав пользователя)
   */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const user = req.user;

      let where: any = {};

      if (user && user.role !== "admin") {
        where.companyId = user.companyId;
      }

      const complexes = await complexRepository.find({
        where,
        relations: ["apartmentTypes", "company"],
        order: { name: "ASC" },
      });

      res.json({ success: true, data: complexes });
    } catch (error) {
      this.handleError(res, error, "Failed to get complexes");
    }
  }

  /**
   * Получить ЖК по ID
   */
  async getOne(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;

      const complex = await complexRepository.findOne({
        where: { id },
        relations: ["apartmentTypes", "company"],
      });

      if (!complex) {
        return this.handleNotFound(res, "Complex");
      }

      if (user?.role !== "admin") {
        if (complex.companyId !== user?.companyId) {
          return res.status(403).json({
            success: false,
            error: "Доступ запрещен. Вы не можете просматривать этот ЖК",
          });
        }
      }

      res.json({ success: true, data: complex });
    } catch (error) {
      this.handleError(res, error, "Failed to get complex");
    }
  }

  /**
   * Создать ЖК (только admin или developer_admin) с типами квартир
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const data = req.body;
      const currentUser = req.user;

      // Проверяем права
      if (
        !currentUser ||
        (currentUser.role !== "admin" && currentUser.role !== "developer_admin")
      ) {
        return res.status(403).json({
          success: false,
          error:
            "Доступ запрещен. Только администратор проекта или компании может создавать ЖК",
        });
      }

      // Если developer_admin, привязываем к его компании
      if (currentUser.role === "developer_admin") {
        if (!currentUser.companyId) {
          return res.status(400).json({
            success: false,
            error: "У вас нет компании",
          });
        }
        data.companyId = currentUser.companyId;
      }

      // 🔥 ДЛЯ ADMIN - проверяем, что companyId передан
      if (currentUser.role === "admin" && !data.companyId) {
        return res.status(400).json({
          success: false,
          error: "Для создания ЖК необходимо указать companyId",
        });
      }

      // Валидация
      if (!data.name) {
        return res.status(400).json({
          success: false,
          error: "Name is required",
        });
      }

      if (!data.status) {
        return res.status(400).json({
          success: false,
          error: "Status is required",
        });
      }

      const { generateSlug } = await import("../../utils/slugify");
      const slug = generateSlug(data.name);

      // Создаем ЖК
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
        companyId: data.companyId,
        createdById: currentUser.id,
      });

      await complexRepository.save(complex);

      // 🔥 СОЗДАЕМ ТИПЫ КВАРТИР
      if (data.apartmentTypes && data.apartmentTypes.length > 0) {
        for (const at of data.apartmentTypes) {
          const apartmentType = apartmentTypeRepository.create({
            type: at.type,
            pricePerSquareMeter: at.pricePerSquareMeter,
            surcharges: at.surcharges || {
              withoutDownPayment: 0,
              partialDownPayment: 0,
            },
            isActive: at.isActive !== undefined ? at.isActive : true,
            complexId: complex.id,
          });
          await apartmentTypeRepository.save(apartmentType);
        }
      }

      // Возвращаем созданный ЖК с отношениями
      const created = await complexRepository.findOne({
        where: { id: complex.id },
        relations: ["apartmentTypes", "company"],
      });

      res.status(201).json({ success: true, data: created });
    } catch (error) {
      this.handleError(res, error, "Failed to create complex");
    }
  }

  /**
   * Обновить ЖК (с проверкой прав)
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const currentUser = req.user;

      const existingComplex = await complexRepository.findOne({
        where: { id },
        relations: ["company", "apartmentTypes"],
      });

      if (!existingComplex) {
        return this.handleNotFound(res, "Complex");
      }

      // Проверяем права
      if (currentUser?.role === "developer_admin") {
        if (existingComplex.companyId !== currentUser.companyId) {
          return res.status(403).json({
            success: false,
            error: "Доступ запрещен. Вы можете редактировать только свои ЖК",
          });
        }
      } else if (currentUser?.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Доступ запрещен. Недостаточно прав",
        });
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

      // Только admin может менять компанию
      if (currentUser?.role === "admin" && data.companyId !== undefined) {
        existingComplex.companyId = data.companyId;
      }

      if (data.name && data.name !== existingComplex.name) {
        const { generateSlug } = await import("../../utils/slugify");
        existingComplex.slug = generateSlug(data.name);
      }

      existingComplex.updatedById = currentUser?.id;

      await complexRepository.save(existingComplex);

      // 🔥 ОБНОВЛЯЕМ ТИПЫ КВАРТИР (если переданы)
      if (data.apartmentTypes && data.apartmentTypes.length > 0) {
        // Удаляем старые типы
        await apartmentTypeRepository.delete({ complexId: id });

        // Создаем новые типы
        for (const at of data.apartmentTypes) {
          const apartmentType = apartmentTypeRepository.create({
            type: at.type,
            pricePerSquareMeter: at.pricePerSquareMeter,
            surcharges: at.surcharges || {
              withoutDownPayment: 0,
              partialDownPayment: 0,
            },
            isActive: at.isActive !== undefined ? at.isActive : true,
            complexId: id,
          });
          await apartmentTypeRepository.save(apartmentType);
        }
      }

      const updated = await complexRepository.findOne({
        where: { id },
        relations: ["apartmentTypes", "company"],
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      this.handleError(res, error, "Failed to update complex");
    }
  }

  /**
   * Удалить ЖК (с проверкой прав)
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      const existingComplex = await complexRepository.findOne({
        where: { id },
        relations: ["apartmentTypes"],
      });

      if (!existingComplex) {
        return this.handleNotFound(res, "Complex");
      }

      // Проверяем права
      if (currentUser?.role === "developer_admin") {
        if (existingComplex.companyId !== currentUser.companyId) {
          return res.status(403).json({
            success: false,
            error: "Доступ запрещен. Вы можете удалять только свои ЖК",
          });
        }
      } else if (currentUser?.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Доступ запрещен. Недостаточно прав",
        });
      }

      // Удаляем типы квартир
      if (
        existingComplex.apartmentTypes &&
        existingComplex.apartmentTypes.length > 0
      ) {
        await apartmentTypeRepository.delete({ complexId: id });
      }

      await complexRepository.delete(id);
      res.json({ success: true, message: "Complex deleted successfully" });
    } catch (error) {
      this.handleError(res, error, "Failed to delete complex");
    }
  }

  // ============================================================
  // 🔥 УПРАВЛЕНИЕ УСЛОВИЯМИ ОПЛАТЫ
  // ============================================================

  // Добавить условие оплаты
  addPaymentTerm = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { term } = req.body;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Не авторизован",
        });
      }

      if (!term || term.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "Условие оплаты обязательно",
        });
      }

      const complex = await complexService.addPaymentTerm(
        id,
        term.trim(),
        user.id,
      );

      if (!complex) {
        return res.status(404).json({
          success: false,
          error: "ЖК не найден",
        });
      }

      res.json({
        success: true,
        data: complex.paymentTerms,
        message: "Условие оплаты добавлено",
      });
    } catch (error) {
      console.error("Error adding payment term:", error);
      res.status(500).json({
        success: false,
        error: "Ошибка добавления условия оплаты",
      });
    }
  };

  // Удалить условие оплаты
  removePaymentTerm = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { term } = req.body;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Не авторизован",
        });
      }

      if (!term || term.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "Условие оплаты обязательно",
        });
      }

      const complex = await complexService.removePaymentTerm(
        id,
        term.trim(),
        user.id,
      );

      if (!complex) {
        return res.status(404).json({
          success: false,
          error: "ЖК не найден",
        });
      }

      res.json({
        success: true,
        data: complex.paymentTerms,
        message: "Условие оплаты удалено",
      });
    } catch (error) {
      console.error("Error removing payment term:", error);
      res.status(500).json({
        success: false,
        error: "Ошибка удаления условия оплаты",
      });
    }
  };

  // Обновить все условия оплаты
  updatePaymentTerms = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { terms } = req.body;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Не авторизован",
        });
      }

      if (!terms || !Array.isArray(terms)) {
        return res.status(400).json({
          success: false,
          error: "Массив условий оплаты обязателен",
        });
      }

      const complex = await complexService.updatePaymentTerms(
        id,
        terms,
        user.id,
      );

      if (!complex) {
        return res.status(404).json({
          success: false,
          error: "ЖК не найден",
        });
      }

      res.json({
        success: true,
        data: complex.paymentTerms,
        message: "Условия оплаты обновлены",
      });
    } catch (error) {
      console.error("Error updating payment terms:", error);
      res.status(500).json({
        success: false,
        error: "Ошибка обновления условий оплаты",
      });
    }
  };
}

export const complexController = new ComplexController();
