// backend/src/services/CompanyService.ts
import { AppDataSource } from "../data-source";
import { Company } from "../entities/Company";
import { User } from "../entities/User";

export class CompanyService {
  private companyRepository = AppDataSource.getRepository(Company);

  async createCompany(data: {
    name: string;
    slug: string;
    adminId?: string;
    description?: string;
    logo?: string;
    website?: string;
    phone?: string;
    address?: string;
  }): Promise<Company> {
    const company = this.companyRepository.create(data);
    return await this.companyRepository.save(company);
  }

  async getCompanyById(id: string): Promise<Company | null> {
    return this.companyRepository.findOne({
      where: { id },
      relations: ["admin", "users"],
    });
  }

  async getCompanyBySlug(slug: string): Promise<Company | null> {
    return this.companyRepository.findOne({
      where: { slug },
      relations: ["admin", "users"],
    });
  }

  async getAllCompanies(): Promise<Company[]> {
    return this.companyRepository.find({
      order: { name: "ASC" },
      relations: ["admin"],
    });
  }

  async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new Error("Компания не найдена");
    }

    Object.assign(company, data);
    return await this.companyRepository.save(company);
  }

  async deleteCompany(id: string): Promise<void> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new Error("Компания не найдена");
    }

    await this.companyRepository.remove(company);
  }

  async getUsersByCompany(companyId: string): Promise<User[]> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ["users"],
    });

    if (!company) {
      throw new Error("Компания не найдена");
    }

    return company.users || [];
  }
}
