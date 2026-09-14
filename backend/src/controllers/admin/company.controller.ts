// backend/src/controllers/admin/company.controller.ts

import { Response } from "express";
import { AppDataSource } from "../../data-source";
import { Company } from "../../entities/Company";
import { User } from "../../entities/User";
import { BaseController } from "./base.controller";
import { AuthRequest } from "../../types/auth.types";

const companyRepository = AppDataSource.getRepository(Company);
const userRepository = AppDataSource.getRepository(User);

export class CompanyController extends BaseController {
  /**
   * Получить все компании (с фильтрацией по правам)
   */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const user = req.user;

      // 🔥 СТРОИМ WHERE В ЗАВИСИМОСТИ ОТ РОЛИ
      let where: any = {};

      // Если пользователь НЕ админ - показываем только его компанию
      if (user && user.role !== "admin") {
        // developer_admin или другие роли видят только свою компанию
        if (user.companyId) {
          where.id = user.companyId;
        } else {
          // Если у пользователя нет компании - возвращаем пустой массив
          return res.json({
            success: true,
            data: [],
          });
        }
      }
      // admin видит все компании (where = {})

      const companies = await companyRepository.find({
        where,
        relations: ["admin", "users"],
        order: { name: "ASC" },
      });

      res.json({
        success: true,
        data: companies,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to get companies");
    }
  }

  /**
   * Получить компанию по ID (с проверкой прав)
   */
  async getOne(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;

      // 🔥 ПРОВЕРЯЕМ ДОСТУП
      if (user && user.role !== "admin") {
        // developer_admin может видеть только свою компанию
        if (!user.companyId || user.companyId !== id) {
          return res.status(403).json({
            success: false,
            error:
              "Доступ запрещен. Вы можете просматривать только свою компанию",
          });
        }
      }

      const company = await companyRepository.findOne({
        where: { id },
        relations: ["admin", "users"],
      });

      if (!company) {
        return this.handleNotFound(res, "Company");
      }

      res.json({
        success: true,
        data: company,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to get company");
    }
  }

  /**
   * Создать компанию (только admin)
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const data = req.body;
      const currentUser = req.user;

      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({
          success: false,
          error:
            "Доступ запрещен. Только администратор проекта может создавать компании",
        });
      }

      if (!data.name) {
        return res.status(400).json({
          success: false,
          error: "Название компании обязательно",
        });
      }

      const existing = await companyRepository.findOne({
        where: { name: data.name },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          error: `Компания с названием "${data.name}" уже существует`,
        });
      }

      const { generateSlug } = await import("../../utils/slugify");
      const slug = generateSlug(data.name);

      const company = companyRepository.create({
        name: data.name,
        slug: slug,
        description: data.description || "",
        phone: data.phone || "",
        address: data.address || "",
        website: data.website || "",
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdById: currentUser.id,
      });

      await companyRepository.save(company);

      const created = await companyRepository.findOne({
        where: { id: company.id },
        relations: ["admin", "users"],
      });

      res.status(201).json({
        success: true,
        data: created,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to create company");
    }
  }

  /**
   * Обновить компанию (только admin)
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const currentUser = req.user;

      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({
          success: false,
          error:
            "Доступ запрещен. Только администратор проекта может обновлять компании",
        });
      }

      const existingCompany = await companyRepository.findOne({
        where: { id },
        relations: ["admin", "users"],
      });

      if (!existingCompany) {
        return this.handleNotFound(res, "Company");
      }

      if (data.name !== undefined) existingCompany.name = data.name;
      if (data.description !== undefined)
        existingCompany.description = data.description;
      if (data.phone !== undefined) existingCompany.phone = data.phone;
      if (data.address !== undefined) existingCompany.address = data.address;
      if (data.website !== undefined) existingCompany.website = data.website;
      if (data.isActive !== undefined) existingCompany.isActive = data.isActive;
      if (data.adminId !== undefined) existingCompany.adminId = data.adminId;

      if (data.name && data.name !== existingCompany.name) {
        const { generateSlug } = await import("../../utils/slugify");
        existingCompany.slug = generateSlug(data.name);
      }

      await companyRepository.save(existingCompany);

      const updated = await companyRepository.findOne({
        where: { id },
        relations: ["admin", "users"],
      });

      res.json({
        success: true,
        data: updated,
        message: "Компания обновлена",
      });
    } catch (error) {
      this.handleError(res, error, "Failed to update company");
    }
  }

  /**
   * Удалить компанию (только admin)
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({
          success: false,
          error:
            "Доступ запрещен. Только администратор проекта может удалять компании",
        });
      }

      const existingCompany = await companyRepository.findOne({
        where: { id },
        relations: ["users"],
      });

      if (!existingCompany) {
        return this.handleNotFound(res, "Company");
      }

      if (existingCompany.users && existingCompany.users.length > 0) {
        for (const user of existingCompany.users) {
          user.companyId = null;
          user.company = null;
          await userRepository.save(user);
        }
      }

      await companyRepository.delete(id);

      res.json({
        success: true,
        message: `Компания "${existingCompany.name}" удалена`,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to delete company");
    }
  }
}

export const companyController = new CompanyController();
