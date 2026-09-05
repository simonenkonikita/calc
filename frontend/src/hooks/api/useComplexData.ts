// hooks/useComplexData.ts
import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import { useAuthExtended } from "../ui/useAuth";

interface ApartmentTypeData {
  type: string;
  pricePerSquareMeter: number;
  surcharges: {
    withoutDownPayment: number;
    partialDownPayment: number;
  };
  isActive: boolean;
}

interface ComplexData {
  id: string;
  name: string;
  slug: string;
  status: string;
  isActive: boolean;
  companyId?: string;
}

interface UseComplexDataReturn {
  complexes: string[];
  complexData: ComplexData[];
  apartmentTypes: ApartmentTypeData[];
  loading: boolean;
  error: string | null;
  loadComplexes: () => Promise<void>;
  loadApartmentTypes: (complexName: string) => Promise<void>;
}

export const useComplexData = () => {
  const { user, isAdmin } = useAuthExtended();

  const [complexes, setComplexes] = useState<string[]>([]);
  const [complexData, setComplexData] = useState<ComplexData[]>([]);
  const [apartmentTypes, setApartmentTypes] = useState<ApartmentTypeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 ИЗВЛЕКАЕМ companyId В ОТДЕЛЬНУЮ ПЕРЕМЕННУЮ
  const companyId = user?.companyId;

  const loadComplexes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getComplexes();

      console.log("📊 API Response:", response);

      if (response.success && Array.isArray(response.data)) {
        let filteredData = response.data;

        // 🔥 ИСПОЛЬЗУЕМ companyId ИЗ ЗАМКНУТОЙ ПЕРЕМЕННОЙ
        if (!isAdmin && companyId) {
          filteredData = response.data.filter(
            (item: any) => item.companyId === companyId,
          );
          console.log(
            `🔍 Filtered complexes for company ${companyId}:`,
            filteredData.length,
          );
        }

        const complexList = filteredData.map((item: any) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          status: item.status,
          isActive: item.isActive,
          companyId: item.companyId,
        }));

        const names = complexList.map((item) => item.name);

        setComplexData(complexList);
        setComplexes(names);

        console.log(`✅ Loaded ${names.length} complexes`);
      } else {
        setError(response.error || "Failed to load complexes");
        setComplexes([]);
        setComplexData([]);
      }
    } catch (err) {
      console.error("❌ Error loading complexes:", err);
      setError(err instanceof Error ? err.message : "Failed to load complexes");
      setComplexes([]);
      setComplexData([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, companyId]); // ✅ ТОЧНЫЕ ЗАВИСИМОСТИ

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
  }, []); // ✅ НЕТ ЗАВИСИМОСТЕЙ

  useEffect(() => {
    loadComplexes();
  }, [loadComplexes]); // ✅ ЗАВИСИТ ОТ loadComplexes

  return {
    complexes,
    complexData,
    apartmentTypes,
    loading,
    error,
    loadComplexes,
    loadApartmentTypes,
  };
};
