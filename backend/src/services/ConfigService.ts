// backend/src/services/ConfigService.ts

import { AppDataSource } from "../data-source";
import { SystemConfig } from "../entities/SystemConfig";
import { Variables, BankOrderItem } from "../types/types";

export class ConfigService {
  private configRepository = AppDataSource.getRepository(SystemConfig);
  private cache: Map<string, any> = new Map();

  async getVariables(): Promise<Variables> {
    const cacheKey = "variables";

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const config = await this.getConfig();

    const variables: Variables = {
      // Государственные лимиты
      familyMortgageLimit: config.familyMortgageLimit,
      maxFamilyMortgageLimit: config.maxFamilyMortgageLimit,
      itMortgageLimit: config.itMortgageLimit,
      maxItMortgageLimit: config.maxItMortgageLimit,

      // Границы для калькулятора
      minArea: config.minArea,
      maxArea: config.maxArea,
      minDownPaymentPercent: config.minDownPaymentPercent,
      maxDownPaymentPercent: config.maxDownPaymentPercent,
      minLoanTerm: config.minLoanTerm,
      maxLoanTerm: config.maxLoanTerm,

      // Дополнительные настройки
      deposit: config.deposit,
      bankOrder: config.bankOrder,
    };

    this.cache.set(cacheKey, variables);
    return variables;
  }

  invalidateVariablesCache(): void {
    this.cache.delete("variables");
    this.cache.delete("config");
  }

  async getConfig(): Promise<SystemConfig> {
    const cacheKey = "config";

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const config = await this.configRepository.findOne({
      where: {},
    });

    if (!config) {
      throw new Error(
        "System configuration not found. Please initialize the system configuration first.",
      );
    }

    this.cache.set(cacheKey, config);
    return config;
  }

  async createConfig(data: Partial<SystemConfig>): Promise<SystemConfig> {
    const existing = await this.configRepository.findOne({
      where: {},
    });

    if (existing) {
      throw new Error(
        "System configuration already exists. Use updateConfig() instead.",
      );
    }

    const config = this.configRepository.create({
      // Государственные лимиты
      familyMortgageLimit: data.familyMortgageLimit!,
      maxFamilyMortgageLimit: data.maxFamilyMortgageLimit!,
      itMortgageLimit: data.itMortgageLimit!,
      maxItMortgageLimit: data.maxItMortgageLimit!,

      // Границы для калькулятора
      minArea: data.minArea!,
      maxArea: data.maxArea!,
      minDownPaymentPercent: data.minDownPaymentPercent!,
      maxDownPaymentPercent: data.maxDownPaymentPercent!,
      minLoanTerm: data.minLoanTerm!,
      maxLoanTerm: data.maxLoanTerm!,

      // Дополнительные настройки
      deposit: data.deposit!,
      bankOrder: data.bankOrder!,
    });

    await this.configRepository.save(config);
    this.invalidateVariablesCache();

    return config;
  }

  async updateConfig(data: Partial<SystemConfig>): Promise<SystemConfig> {
    let config = await this.configRepository.findOne({
      where: {},
    });

    if (!config) {
      throw new Error(
        "System configuration not found. Please create configuration first.",
      );
    }

    // Государственные лимиты
    if (data.familyMortgageLimit !== undefined) {
      config.familyMortgageLimit = data.familyMortgageLimit;
    }
    if (data.maxFamilyMortgageLimit !== undefined) {
      config.maxFamilyMortgageLimit = data.maxFamilyMortgageLimit;
    }
    if (data.itMortgageLimit !== undefined) {
      config.itMortgageLimit = data.itMortgageLimit;
    }
    if (data.maxItMortgageLimit !== undefined) {
      config.maxItMortgageLimit = data.maxItMortgageLimit;
    }

    // Границы для калькулятора
    if (data.minArea !== undefined) {
      config.minArea = data.minArea;
    }
    if (data.maxArea !== undefined) {
      config.maxArea = data.maxArea;
    }
    if (data.minDownPaymentPercent !== undefined) {
      config.minDownPaymentPercent = data.minDownPaymentPercent;
    }
    if (data.maxDownPaymentPercent !== undefined) {
      config.maxDownPaymentPercent = data.maxDownPaymentPercent;
    }
    if (data.minLoanTerm !== undefined) {
      config.minLoanTerm = data.minLoanTerm;
    }
    if (data.maxLoanTerm !== undefined) {
      config.maxLoanTerm = data.maxLoanTerm;
    }

    // Дополнительные настройки
    if (data.deposit !== undefined) {
      config.deposit = data.deposit;
    }
    if (data.bankOrder !== undefined) {
      config.bankOrder = data.bankOrder;
    }

    await this.configRepository.save(config);
    this.invalidateVariablesCache();

    return config;
  }

  async updateConfigField(
    field: keyof SystemConfig,
    value: any,
  ): Promise<SystemConfig> {
    let config = await this.configRepository.findOne({
      where: {},
    });

    if (!config) {
      throw new Error(
        `System configuration not found. Cannot update field "${field}".`,
      );
    }

    (config as any)[field] = value;
    await this.configRepository.save(config);
    this.invalidateVariablesCache();

    return config;
  }

  async getDeposit(): Promise<number> {
    const config = await this.getConfig();
    return config.deposit;
  }

  async getBankOrder(): Promise<BankOrderItem[]> {
    const config = await this.getConfig();
    return config.bankOrder || [];
  }

  async getBankNamesOrdered(): Promise<string[]> {
    const bankOrder = await this.getBankOrder();
    const sorted = [...bankOrder].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );
    return sorted.map((item) => item.name);
  }

  async getFamilyLimits(): Promise<{ limit: number; maxLimit: number }> {
    const config = await this.getConfig();
    return {
      limit: config.familyMortgageLimit,
      maxLimit: config.maxFamilyMortgageLimit,
    };
  }

  async getItLimits(): Promise<{ limit: number; maxLimit: number }> {
    const config = await this.getConfig();
    return {
      limit: config.itMortgageLimit,
      maxLimit: config.maxItMortgageLimit,
    };
  }

  async hasConfig(): Promise<boolean> {
    try {
      const config = await this.configRepository.findOne({
        where: {},
      });
      return !!config;
    } catch (error) {
      return false;
    }
  }

  async deleteConfig(): Promise<void> {
    await this.configRepository.delete({});
    this.invalidateVariablesCache();
  }
}

export default ConfigService;
