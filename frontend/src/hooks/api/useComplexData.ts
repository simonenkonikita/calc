// hooks/useComplexData.ts
import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";

interface ApartmentTypeData {
  type: string;
  pricePerSquareMeter: number;
  surcharges: {
    withoutDownPayment: number;
    partialDownPayment: number;
  };
  isActive: boolean;
}

interface UseComplexDataReturn {
  complexes: string[];
  apartmentTypes: ApartmentTypeData[];
  loading: boolean;
  error: string | null;
  loadComplexes: () => Promise<void>;
  loadApartmentTypes: (complexName: string) => Promise<void>;
}

export const useComplexData = () => {
  const [complexes, setComplexes] = useState<string[]>([]);
  const [apartmentTypes, setApartmentTypes] = useState<ApartmentTypeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComplexes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getComplexes();

      if (response.success && Array.isArray(response.data)) {
        // Извлекаем имена из объектов
        const names = response.data.map((item: any) => {
          if (item && typeof item === "object" && "name" in item) {
            return item.name;
          }
          if (item && typeof item === "object" && "complexName" in item) {
            return item.complexName;
          }
          if (typeof item === "string") {
            return item;
          }
          return String(item);
        });

        setComplexes(names);
      } else {
        setError(response.error || "Failed to load complexes");
        setComplexes([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load complexes");
      setComplexes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadApartmentTypes = useCallback(async (complexName: string) => {
    if (!complexName) {
      setApartmentTypes([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.getComplexTypes(complexName);

      if (response.success && Array.isArray(response.data)) {
        const types = response.data.map((item: any) => ({
          type: item.type || item,
          pricePerSquareMeter: Number(item.pricePerSquareMeter) || 0,
          surcharges: item.surcharges || {
            withoutDownPayment: 0,
            partialDownPayment: 0,
          },
          isActive: item.isActive !== undefined ? item.isActive : true,
        }));

        setApartmentTypes(types);
      } else {
        setError(response.error || "Failed to load apartment types");
        setApartmentTypes([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load apartment types",
      );
      setApartmentTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplexes();
  }, [loadComplexes]);

  return {
    complexes,
    apartmentTypes,
    loading,
    error,
    loadComplexes,
    loadApartmentTypes,
  };
};
