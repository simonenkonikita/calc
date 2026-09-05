// hooks/useComplexData.ts
import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import { useAuthExtended } from "../ui/useAuth";

interface ApartmentTypeData {
  id?: string;
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
  description?: string;
  isActive: boolean;
  companyId?: string;
  companyName?: string;
  apartmentTypes?: ApartmentTypeData[];
}

interface UseComplexDataReturn {
  complexes: string[];
  complexData: ComplexData[];
  apartmentTypes: ApartmentTypeData[];
  loading: boolean;
  error: string | null;
  loadComplexes: (companyId?: string) => Promise<void>; // 🔥 Добавляем параметр companyId
  loadApartmentTypes: (complexName: string) => Promise<void>;
  setCompanyId: (companyId: string) => void; // 🔥 Метод для установки компании
}

export const useComplexData = () => {
  const { user, isAdmin } = useAuthExtended();

  const [complexes, setComplexes] = useState<string[]>([]);
  const [complexData, setComplexData] = useState<ComplexData[]>([]);
  const [apartmentTypes, setApartmentTypes] = useState<ApartmentTypeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 СОСТОЯНИЕ ДЛЯ ТЕКУЩЕЙ КОМПАНИИ
  const [selectedCompanyId, setSelectedCompanyId] = useState<
    string | undefined
  >(!isAdmin ? user?.companyId : undefined);

  // 🔥 ЗАГРУЗКА ЖК С ФИЛЬТРАЦИЕЙ ПО КОМПАНИИ
  const loadComplexes = useCallback(
    async (companyId?: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.getComplexes();

        console.log("📊 API Response:", response);

        if (response.success && Array.isArray(response.data)) {
          let filteredData = response.data;

          // 🔥 ФИЛЬТРУЕМ ПО КОМПАНИИ
          const filterCompanyId = companyId || selectedCompanyId;

          if (!isAdmin && filterCompanyId) {
            filteredData = response.data.filter(
              (item: any) => item.companyId === filterCompanyId,
            );
            console.log(
              `🔍 Filtered complexes for company ${filterCompanyId}:`,
              filteredData.length,
            );
          } else if (isAdmin && filterCompanyId) {
            // Админ может фильтровать по выбранной компании
            filteredData = response.data.filter(
              (item: any) => item.companyId === filterCompanyId,
            );
            console.log(
              `🔍 Admin filtered complexes for company ${filterCompanyId}:`,
              filteredData.length,
            );
          }

          const complexList: ComplexData[] = filteredData.map((item: any) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            status: item.status || "проект",
            description: item.description || "",
            isActive: item.isActive !== undefined ? item.isActive : true,
            companyId: item.companyId,
            companyName: item.company?.name,
            apartmentTypes:
              item.apartmentTypes?.map((at: any) => ({
                id: at.id,
                type: at.type,
                pricePerSquareMeter: at.pricePerSquareMeter,
                surcharges: at.surcharges || {
                  withoutDownPayment: 0,
                  partialDownPayment: 0,
                },
                isActive: at.isActive !== undefined ? at.isActive : true,
              })) || [],
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
        setError(
          err instanceof Error ? err.message : "Failed to load complexes",
        );
        setComplexes([]);
        setComplexData([]);
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, selectedCompanyId],
  );

  // 🔥 ЗАГРУЗКА ТИПОВ КВАРТИР
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
        const types: ApartmentTypeData[] = response.data.map((item: any) => ({
          id: item.id,
          type: item.type || item,
          pricePerSquareMeter: Number(item.pricePerSquareMeter) || 0,
          surcharges: item.surcharges || {
            withoutDownPayment: 0,
            partialDownPayment: 0,
          },
          isActive: item.isActive !== undefined ? item.isActive : true,
        }));

        setApartmentTypes(types);
        console.log(
          `✅ Loaded ${types.length} apartment types for ${complexName}`,
        );
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

  // 🔥 УСТАНОВКА КОМПАНИИ
  const setCompanyId = useCallback((companyId: string) => {
    setSelectedCompanyId(companyId);
  }, []);

  // 🔥 ЗАГРУЗКА ПРИ ИЗМЕНЕНИИ КОМПАНИИ
  useEffect(() => {
    if (isAdmin) {
      // Админ загружает все ЖК или по выбранной компании
      loadComplexes(selectedCompanyId);
    } else {
      // Не-админ загружает только свою компанию
      loadComplexes(user?.companyId);
    }
  }, [isAdmin, selectedCompanyId, user?.companyId, loadComplexes]);

  // 🔥 ПРИ ИЗМЕНЕНИИ ПОЛЬЗОВАТЕЛЯ - ОБНОВЛЯЕМ КОМПАНИЮ
  useEffect(() => {
    if (!isAdmin && user?.companyId) {
      setSelectedCompanyId(user.companyId);
    }
  }, [isAdmin, user?.companyId]);

  return {
    complexes,
    complexData,
    apartmentTypes,
    loading,
    error,
    loadComplexes,
    loadApartmentTypes,
    setCompanyId,
    selectedCompanyId,
  };
};
