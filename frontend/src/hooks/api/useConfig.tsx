// src/hooks/api/useConfig.ts

import { useState, useEffect, useCallback } from "react";
import { ConfigData } from "../../utils/types";

export const useConfig = () => {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/config");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // ✅ Преобразуем строки в числа
        setConfig({
          ...result.data,
          familyMortgageLimit: Number(result.data.familyMortgageLimit),
          maxFamilyMortgageLimit: Number(result.data.maxFamilyMortgageLimit),
          itMortgageLimit: Number(result.data.itMortgageLimit),
          maxItMortgageLimit: Number(result.data.maxItMortgageLimit),
          minArea: Number(result.data.minArea),
          maxArea: Number(result.data.maxArea),
          minDownPaymentPercent: Number(result.data.minDownPaymentPercent),
          maxDownPaymentPercent: Number(result.data.maxDownPaymentPercent),
          deposit: Number(result.data.deposit),
        });
      } else {
        setError(result.error || "Failed to load config");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading config");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // ✅ Метод для принудительного обновления
  const refresh = useCallback(async () => {
    await fetchConfig();
  }, [fetchConfig]);

  return { config, loading, error, refresh };
};
