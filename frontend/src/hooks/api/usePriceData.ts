// hooks/usePriceData.ts
import { useState, useCallback } from "react";
import { api } from "../../services/api";

interface PriceData {
  pricePerSquareMeter: number;
  surcharges: {
    withoutDownPayment: number;
    partialDownPayment: number;
  };
}

interface UsePriceDataReturn {
  priceData: PriceData | null;
  loading: boolean;
  error: string | null;
  fetchPrice: (complex: string, type: string) => Promise<void>;
}

export const usePriceData = (): UsePriceDataReturn => {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async (complex: string, type: string) => {
    if (!complex || !type) {
      setPriceData(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.getPrice(complex, type);
      if (response.success) {
        setPriceData(response.data);
      } else {
        setError(response.error || "Failed to load price data");
        setPriceData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load price data");
      setPriceData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    priceData,
    loading,
    error,
    fetchPrice,
  };
};