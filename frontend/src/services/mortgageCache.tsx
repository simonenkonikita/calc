import { ObjectCalculationResult, BankProgramResult } from "../utils/types";

export interface MortgageResult {
  objectResult: ObjectCalculationResult;
  bankResults: BankProgramResult[];
}

/**
 * Сервис для кеширования результатов расчета ипотеки
 */
class MortgageCacheService {
  private cache = new Map<string, MortgageResult>();

  /**
   * Получить данные из кеша
   */
  get(formData: Record<string, any>): MortgageResult | undefined {
    const key = this.generateKey(formData);
    return this.cache.get(key);
  }

  /**
   * Сохранить данные в кеш
   */
  set(formData: Record<string, any>, data: MortgageResult): void {
    const key = this.generateKey(formData);
    this.cache.set(key, data);
  }

  /**
   * Проверить наличие в кеше
   */
  has(formData: Record<string, any>): boolean {
    const key = this.generateKey(formData);
    return this.cache.has(key);
  }

  /**
   * Очистить весь кеш
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Удалить конкретную запись
   */
  delete(formData: Record<string, any>): boolean {
    const key = this.generateKey(formData);
    return this.cache.delete(key);
  }

  /**
   * Получить размер кеша
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Генерация ключа для кеша
   */
  private generateKey(formData: Record<string, any>): string {
    // Ключ формируется из всех полей формы
    return JSON.stringify(formData);
  }
}

// Создаем единственный экземпляр (Singleton)
export const mortgageCache = new MortgageCacheService();
