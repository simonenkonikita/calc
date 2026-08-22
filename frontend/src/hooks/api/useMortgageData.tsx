// hooks/useMortgageData.ts

import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "../../services/api";
import { mortgageCache } from "../../services/mortgageCache";
import {
  ObjectCalculationResult,
  BankProgramResult,
  CalculatorFormData,
} from "../../utils/types";

export const useMortgageData = () => {
  const [results, setResults] = useState<{
    objectResult: ObjectCalculationResult;
    bankResults: BankProgramResult[];
  } | null>(null);

  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // 🔥 Функция расчета
  const calculate = useCallback(async (formData: CalculatorFormData) => {
    // Отменяем предыдущий запрос
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 🔥 Проверяем кеш (через сервис)
    if (mortgageCache.has(formData)) {
      const cachedData = mortgageCache.get(formData);
      if (cachedData) {
        setResults(cachedData);
        return;
      }
    }

    setIsCalculating(true);
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await api.calculate(formData);

      if (controller.signal.aborted) return;

      if (response.success) {
        // 🔥 Сохраняем в кеш (через сервис)
        mortgageCache.set(formData, response.data);
        setResults(response.data);
      } else {
        throw new Error(response.error || "Unknown error");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Ошибка при расчёте:", err);
      setError(err instanceof Error ? err.message : "Произошла ошибка");
      setResults(null);
    } finally {
      if (!controller.signal.aborted) {
        setIsCalculating(false);
      }
    }
  }, []);

  // 🔥 Очистка кеша (через сервис)
  const clearCache = useCallback(() => {
    mortgageCache.clear();
  }, []);

  // 🔥 Получить размер кеша
  const getCacheSize = useCallback(() => {
    return mortgageCache.size();
  }, []);

  // 🔥 Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    results,
    isCalculating,
    error,
    calculate,
    clearCache,
    getCacheSize,
  };
};
