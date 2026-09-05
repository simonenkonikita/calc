// frontend/src/pages/Admin/sections/offers/hooks/useOffersData.ts

import { useState, useEffect } from "react";
import { DynamicData } from "../types";
import adminApi from "../../../../../services/adminApi";
import {
  AdminOffer,
  AdminBank,
  AdminProgram,
  AdminComplex,
} from "../../../types/admin.types";

export const useOffersData = () => {
  const [offers, setOffers] = useState<AdminOffer[]>([]);
  const [banks, setBanks] = useState<AdminBank[]>([]);
  const [programs, setPrograms] = useState<AdminProgram[]>([]);
  const [complexes, setComplexes] = useState<AdminComplex[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [dynamicDataMap, setDynamicDataMap] = useState<
    Record<string, DynamicData>
  >({});

  const loadData = async () => {
    try {
      setLoading(true);

      const [offersData, banksData, programsData, complexesData] =
        await Promise.all([
          adminApi.getOffers(),
          adminApi.getBanks(),
          adminApi.getPrograms(),
          adminApi.getComplexes(),
        ]);

      setOffers(Array.isArray(offersData) ? offersData : []);
      setBanks(Array.isArray(banksData) ? banksData : []);
      setPrograms(Array.isArray(programsData) ? programsData : []);
      setComplexes(Array.isArray(complexesData) ? complexesData : []);

      // 🔥 Выбираем первый активный банк по умолчанию
      if (banksData.length > 0 && !selectedBankId) {
        const firstActiveBank = banksData.find((b: AdminBank) => b.isActive);
        setSelectedBankId(firstActiveBank?.id || banksData[0].id);
      }

      // 🔥 Загружаем динамические данные из офферов
      loadDynamicDataFromOffers(offersData);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Ошибка при загрузке данных");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Функция: загружает динамические данные из самих офферов
  const loadDynamicDataFromOffers = (offersData: AdminOffer[]) => {
    const dataMap: Record<string, DynamicData> = {};

    for (const offer of offersData) {
      // 🔥 Сортируем ставки по priority
      const rates = (offer.dynamicRates ?? [])
        .map((rate: any) => ({ ...rate }))
        .sort((a, b) => (a.priority || 0) - (b.priority || 0));

      // 🔥 Сортируем субсидии по priority
      const subsidies = (offer.dynamicSubsidies ?? [])
        .map((subsidy: any) => ({ ...subsidy }))
        .sort((a, b) => (a.priority || 0) - (b.priority || 0));

      dataMap[offer.id] = {
        rates: Array.isArray(rates) ? rates : [],
        subsidies: Array.isArray(subsidies) ? subsidies : [],
      };
    }

    setDynamicDataMap(dataMap);
    console.log(
      `📊 Loaded dynamic data from offers: ${Object.keys(dataMap).length} offers processed`,
    );
  };

  // 🔥 Загрузка динамических данных через API (используется как fallback или при refresh)
  const loadDynamicDataFromAPI = async (offersData: AdminOffer[]) => {
    const dataMap: Record<string, DynamicData> = {};
    for (const offer of offersData) {
      try {
        const [rates, subsidies] = await Promise.all([
          adminApi.getOfferDynamicRates(offer.id),
          adminApi.getOfferDynamicSubsidies(offer.id),
        ]);
        dataMap[offer.id] = {
          rates: Array.isArray(rates) ? rates : [],
          subsidies: Array.isArray(subsidies) ? subsidies : [],
        };
      } catch (error) {
        console.error(
          `Error loading dynamic data for offer ${offer.id}:`,
          error,
        );
        dataMap[offer.id] = { rates: [], subsidies: [] };
      }
    }
    setDynamicDataMap(dataMap);
  };

  const refresh = async () => {
    await loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    offers,
    banks,
    programs,
    complexes,
    loading,
    selectedBankId,
    dynamicDataMap,
    setSelectedBankId,
    refresh,
  };
};
