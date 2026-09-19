// frontend/src/hooks/api/useCompanies.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import { CompanyData } from "../../utils/types";
import adminApi from "../../services/adminApi";
import { useAuthExtended } from "../ui/useAuth";

interface UseCompaniesReturn {
  companies: CompanyData[];
  loading: boolean;
  error: string | null;
  loadCompanies: () => Promise<void>;
}

export const useCompanies = (): UseCompaniesReturn => {
  const { isAdmin, user } = useAuthExtended();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 ИЗВЛЕКАЕМ companyId В ОТДЕЛЬНУЮ ПЕРЕМЕННУЮ ДЛЯ СТАБИЛЬНОСТИ
  const companyId = useMemo(() => user?.companyId, [user?.companyId]);

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let companiesData: CompanyData[] = [];

      if (isAdmin) {
        // Админ видит все компании
        const response = await adminApi.getCompanies();
        companiesData = response.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          deposit: c.deposit ?? null,
          isActive: c.isActive !== undefined ? c.isActive : true,
        }));
      } else if (companyId) {
        // Обычный пользователь видит только свою компанию
        const response = await adminApi.getCompany(companyId);
        companiesData = [
          {
            id: response.id,
            name: response.name,
            slug: response.slug,
            deposit: response.deposit ?? null,
            isActive:
              response.isActive !== undefined ? response.isActive : true,
          },
        ];
      }

      // Фильтруем только активные компании
      const activeCompanies = companiesData.filter((c) => c.isActive !== false);
      setCompanies(activeCompanies);

      console.log(`✅ Loaded ${activeCompanies.length} companies`);
    } catch (err) {
      console.error("❌ Error loading companies:", err);
      setError(err instanceof Error ? err.message : "Failed to load companies");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, companyId]); // ✅ ИСПОЛЬЗУЕМ companyId ВМЕСТО user?.companyId

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  return {
    companies,
    loading,
    error,
    loadCompanies,
  };
};
