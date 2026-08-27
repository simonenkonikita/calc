// backend/src/services/ConfigService.ts

import { AppDataSource } from "../data-source";
import { Config } from "../entities/Config";
import { Variables } from "../types/types";
import { DEPOSIT_AMOUNT } from "../data/complexPrice/CONSTRUCTION";
import { MIN_PV_PERCENT } from "../data/banks/constants";
import { BANK_NAMES } from "../data/banks/constants";

export class ConfigService {
  private configRepository = AppDataSource.getRepository(Config);
  private cache: Map<string, any> = new Map(); // ← ДОБАВЛЯЕМ ЭТУ СТРОКУ

  /**
   * Получить Variables для калькулятора
   */
  async getVariables(): Promise<Variables> {
    const cacheKey = "variables";

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const config = await this.getConfig();

      const variables: Variables = {
        familyMortgageLimit: config.familyMortgageLimit || 6000000,
        maxFamilyMortgageSum: config.maxFamilyMortgageSum || 15000000,
        itMortgageLimit: config.itMortgageLimit || 9000000,
        maxItMortgageSum: config.maxItMortgageSum || 18000000,
        deposit: config.depositAmount || 30000,
        minExcessAmountsFamily: config.minExcessAmounts || {
          Сбербанк: 6300000,
          ВТБ: 6150000,
          "Альфа-Банк": 6000000,
          Совкомбанк: 7500000,
          Уралсиб: 6000000,
          "Дом.РФ Банк": 6000000,
        },
        minExcessAmountsIt: config.minExcessAmounts || {
          Сбербанк: 9300000,
          ВТБ: 9150000,
          "Альфа-Банк": 9000000,
          Совкомбанк: 10500000,
          Уралсиб: 9000000,
          "Дом.РФ Банк": 9000000,
        },
      };

      this.cache.set(cacheKey, variables);
      return variables;
    } catch (error) {
      console.error("Error getting variables:", error);
      return this.getDefaultVariables();
    }
  }

  /**
   * Инвалидация кэша переменных
   */
  invalidateVariablesCache(): void {
    this.cache.delete("variables");
  }

  /**
   * Получить конфигурацию
   */
  async getConfig(): Promise<any> {
    const cacheKey = "config";

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      let config = await this.configRepository.findOne({
        where: { key: "app_config" },
      });

      if (!config) {
        console.log("⚠️ Config not found, creating default config...");
        config = new Config();
        config.key = "app_config";
        config.value = this.getDefaultConfig();
        await this.configRepository.save(config);
        console.log("✅ Default config created");
      }

      this.cache.set(cacheKey, config.value);
      return config.value;
    } catch (error) {
      console.error("Error in getConfig:", error);
      throw error;
    }
  }

  /**
   * Обновить конфигурацию
   */
  async updateConfig(data: Partial<any>): Promise<any> {
    try {
      console.log("📝 Updating config with data:", data);

      let config = await this.configRepository.findOne({
        where: { key: "app_config" },
      });

      if (!config) {
        console.log("⚠️ Config not found, creating new...");
        config = new Config();
        config.key = "app_config";
        config.value = this.getDefaultConfig();
      }

      const updatedValue = {
        ...config.value,
        ...data,
      };

      config.value = updatedValue;
      await this.configRepository.save(config);

      // Инвалидируем кэш
      this.invalidateVariablesCache();
      this.cache.delete("config");

      console.log("✅ Config updated:", updatedValue);
      return config.value;
    } catch (error) {
      console.error("Error in updateConfig:", error);
      throw error;
    }
  }

  /**
   * Получить конфигурацию по ключу
   */
  async getConfigByKey(key: string): Promise<any> {
    try {
      const config = await this.configRepository.findOne({
        where: { key },
      });
      return config?.value || null;
    } catch (error) {
      console.error(`Error in getConfigByKey for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Обновить конкретное поле в конфигурации
   */
  async updateConfigField(
    key: string,
    field: string,
    value: any,
  ): Promise<any> {
    try {
      console.log(`📝 Updating field "${field}" to:`, value);

      let config = await this.configRepository.findOne({
        where: { key },
      });

      if (!config) {
        console.log("⚠️ Config not found, creating new...");
        config = new Config();
        config.key = key;
        config.value = this.getDefaultConfig();
      }

      config.value[field] = value;
      await this.configRepository.save(config);

      // Инвалидируем кэш
      this.invalidateVariablesCache();
      this.cache.delete("config");

      console.log(`✅ Field "${field}" updated`);
      return config.value;
    } catch (error) {
      console.error(
        `Error in updateConfigField for key ${key}, field ${field}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Сбросить конфигурацию до значений по умолчанию
   */
  async resetConfig(): Promise<any> {
    try {
      console.log("🔄 Resetting config to default values...");

      let config = await this.configRepository.findOne({
        where: { key: "app_config" },
      });

      if (!config) {
        config = new Config();
        config.key = "app_config";
      }

      config.value = this.getDefaultConfig();
      await this.configRepository.save(config);

      // Инвалидируем кэш
      this.invalidateVariablesCache();
      this.cache.delete("config");

      console.log("✅ Config reset to default");
      return config.value;
    } catch (error) {
      console.error("Error in resetConfig:", error);
      throw error;
    }
  }

  /**
   * Проверить наличие конфигурации
   */
  async hasConfig(): Promise<boolean> {
    try {
      const config = await this.configRepository.findOne({
        where: { key: "app_config" },
      });
      return !!config;
    } catch (error) {
      console.error("Error in hasConfig:", error);
      return false;
    }
  }

  /**
   * Удалить конфигурацию
   */
  async deleteConfig(): Promise<void> {
    try {
      console.log("🗑️ Deleting config...");
      await this.configRepository.delete({ key: "app_config" });

      // Инвалидируем кэш
      this.invalidateVariablesCache();
      this.cache.delete("config");

      console.log("✅ Config deleted");
    } catch (error) {
      console.error("Error in deleteConfig:", error);
      throw error;
    }
  }

  /**
   * Значения по умолчанию для Variables
   */
  private getDefaultVariables(): Variables {
    return {
      familyMortgageLimit: 6000000,
      maxFamilyMortgageSum: 15000000,
      itMortgageLimit: 9000000,
      maxItMortgageSum: 18000000,
      deposit: 30000,
      minExcessAmountsFamily: {
        Сбербанк: 6300000,
        ВТБ: 6150000,
        "Альфа-Банк": 6000000,
        Совкомбанк: 7500000,
        Уралсиб: 6000000,
        "Дом.РФ Банк": 6000000,
      },
      minExcessAmountsIt: {
        Сбербанк: 9300000,
        ВТБ: 9150000,
        "Альфа-Банк": 9000000,
        Совкомбанк: 10500000,
        Уралсиб: 9000000,
        "Дом.РФ Банк": 9000000,
      },
    };
  }

  /**
   * Значения конфигурации по умолчанию
   */
  private getDefaultConfig(): any {
    return {
      // Основные настройки
      depositAmount: DEPOSIT_AMOUNT || 30000,
      minDownPayment: MIN_PV_PERCENT || 20.1,
      maxLoanTerm: 30,
      defaultComplex: "ЖК Сады у моря 3",
      bankOrder: Object.values(BANK_NAMES) || [],

      // Льготные программы
      enableFamilyMortgage: true,
      enableITMortgage: true,
      familyMortgageLimit: 6000000,
      itMortgageLimit: 9000000,
      maxFamilyMortgageSum: 15000000,
      maxItMortgageSum: 18000000,

      // Минимальные суммы для сверхлимита по банкам
      minExcessAmountsFamily: {
        Сбербанк: 6300000,
        ВТБ: 6150000,
        "Альфа-Банк": 6000000,
        Совкомбанк: 7500000,
        Уралсиб: 6000000,
        "Дом.РФ Банк": 6000000,
      },

      minExcessAmountsIt: {
        Сбербанк: 9300000,
        ВТБ: 9150000,
        "Альфа-Банк": 9000000,
        Совкомбанк: 10500000,
        Уралсиб: 9000000,
        "Дом.РФ Банк": 9000000,
      },

      // Дополнительные настройки
      showOverstatement: true,
      enableSpecialMortgageMode: false,
      defaultLoanTerm: 30,

      // Настройки отображения
      currency: "₽",
      locale: "ru-RU",
    };
  }
}

export default ConfigService;
