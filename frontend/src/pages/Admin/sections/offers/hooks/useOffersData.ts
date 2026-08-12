// frontend/src/pages/Admin/sections/offers/hooks/useOffersData.ts

import { useState, useEffect } from "react";
import { DynamicData } from "../types";
import adminApi from "../../../../../services/adminApi";
import { AdminOffer, AdminBank, AdminProgram, AdminComplex } from "../../../types/admin.types";

export const useOffersData = () => {
  const [offers, setOffers] = useState<AdminOffer[]>([]);
  const [banks, setBanks] = useState<AdminBank[]>([]);
  const [programs, setPrograms] = useState<AdminProgram[]>([]);
  const [complexes, setComplexes] = useState<AdminComplex[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [dynamicDataMap, setDynamicDataMap] = useState<Record<string, DynamicData>>({});

  const loadData = async () => {
    try {
      setLoading(true);
      const [offersData, banksData, programsData, complexesData] = await Promise.all([
        adminApi.getOffers(),
        adminApi.getBanks(),
        adminApi.getPrograms(),
        adminApi.getComplexes(),
      ]);
      setOffers(Array.isArray(offersData) ? offersData : []);
      setBanks(Array.isArray(banksData) ? banksData : []);
      setPrograms(Array.isArray(programsData) ? programsData : []);
      setComplexes(Array.isArray(complexesData) ? complexesData : []);

      if (banksData.length > 0 && !selectedBankId) {
        setSelectedBankId(banksData[0].id);
      }

      await loadDynamicData(offersData);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Ошибка при загрузке данных");
    } finally {
      setLoading(false);
    }
  };

  const loadDynamicData = async (offersData: AdminOffer[]) => {
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
        console.error(`Error loading dynamic data for offer ${offer.id}:`, error);
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