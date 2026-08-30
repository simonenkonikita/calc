// hooks/useMortgageCalculator.ts

import { useState, useCallback, useRef, useEffect } from "react";
import { CalculatorFormData } from "../../utils/types";
import { formatMoney } from "../../utils/formatMoney";
import { useMortgageData } from "../api/useMortgageData";
import { useConfig } from "../api/useConfig";

// 🔥 Базовые дефолтные значения (минимальные, только для инициализации)
const DEFAULT_FORM_DATA: CalculatorFormData = {
  complex: "",
  apartmentType: "",
  area: 30,
  manualObjectCost: null,
  considerDepositInCost: false,
  downPaymentPercent: 20.1,
  manualDownPayment: 0,
  loanTerm: 30,
  projectFinancingBank: "Сбербанк",
  noSubsidyInflate: false,
  mortgageWithoutDownPayment: false,
  mortgagePartialDownPayment: false,
};

export const useMortgageCalculator = () => {
  const { results, isCalculating, error, calculate, clearCache } =
    useMortgageData();

  // 🔥 Получаем конфиг
  const { config, loading: configLoading } = useConfig();

  // 🔥 Инициализируем форму с дефолтными значениями
  const [formData, setFormData] = useState<CalculatorFormData>(() => {
    if (config) {
      return {
        complex: "",
        apartmentType: "",
        area: 30,
        manualObjectCost: null,
        considerDepositInCost: false,
        downPaymentPercent: config.minDownPaymentPercent ?? 20.1,
        manualDownPayment: 0,
        loanTerm: config.maxLoanTerm ?? 30,
        projectFinancingBank: "Сбербанк",
        noSubsidyInflate: false,
        mortgageWithoutDownPayment: false,
        mortgagePartialDownPayment: false,
      };
    }
    return DEFAULT_FORM_DATA;
  });

  // 🔥 Обновляем форму, когда конфиг загрузился
  useEffect(() => {
    if (config) {
      setFormData((prev) => ({
        ...prev,
        area: 30,
        downPaymentPercent:
          config.minDownPaymentPercent ?? prev.downPaymentPercent,
        loanTerm: config.maxLoanTerm ?? 30,
      }));
    }
  }, [config]);

  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number | null>(
    null,
  );

  const minDownPaymentPercent = config?.minDownPaymentPercent ?? 20.1;

  // 🔥 Ref для восстановления выбранного оффера
  const selectedOfferRef = useRef<number | null>(null);

  // 🔥 Фильтры
  const filtersRef = useRef({
    selectedBankFilter: "all",
    selectedProgramTypeFilter: "all",
    selectedCards: new Set<number>(),
    showOverstatement: false,
  });

  // ============================================================
  // ОБРАБОТЧИКИ
  // ============================================================

  const handleInputChange = useCallback(
    <K extends keyof CalculatorFormData>(
      field: K,
      value: CalculatorFormData[K],
    ) => {
      setFormData((prev) => {
        let newData = { ...prev, [field]: value };

        if (field === "mortgageWithoutDownPayment" && value === true) {
          newData.downPaymentPercent = minDownPaymentPercent;
          newData.mortgagePartialDownPayment = false;
        }

        if (field === "mortgagePartialDownPayment" && value === true) {
          newData.downPaymentPercent = minDownPaymentPercent;
          newData.mortgageWithoutDownPayment = false;
        }

        if (
          field === "downPaymentPercent" &&
          (newData.mortgageWithoutDownPayment ||
            newData.mortgagePartialDownPayment)
        ) {
          return {
            ...prev,
            [field]: prev.downPaymentPercent,
            mortgageWithoutDownPayment: prev.mortgageWithoutDownPayment,
            mortgagePartialDownPayment: prev.mortgagePartialDownPayment,
          };
        }

        if (
          field === "manualDownPayment" &&
          typeof value === "number" &&
          value > 0
        ) {
          newData = {
            ...newData,
            downPaymentPercent: minDownPaymentPercent,
          };
        }

        return newData;
      });

      // Сбрасываем выбранный оффер при изменении ключевых параметров
      const shouldResetOffer = [
        "complex",
        "apartmentType",
        "area",
        "manualObjectCost",
        "considerDepositInCost",
        "downPaymentPercent",
        "manualDownPayment",
        "loanTerm",
        "noSubsidyInflate",
        "mortgageWithoutDownPayment",
        "mortgagePartialDownPayment",
      ].includes(field as string);

      if (shouldResetOffer) {
        setSelectedOfferIndex(null);
        selectedOfferRef.current = null;
        filtersRef.current.selectedCards = new Set();
      }
    },
    [minDownPaymentPercent],
  );

  const handleSelectOffer = useCallback((index: number) => {
    setSelectedOfferIndex(index);
    selectedOfferRef.current = index;
  }, []);

  // ============================================================
  // ФИЛЬТРЫ
  // ============================================================

  const getFiltersRef = useCallback(() => filtersRef.current, []);

  const updateFilters = useCallback(
    (updates: Partial<typeof filtersRef.current>) => {
      filtersRef.current = { ...filtersRef.current, ...updates };
    },
    [],
  );

  // ============================================================
  // РУЧНОЙ ПЕРЕСЧЕТ (по кнопке)
  // ============================================================

  const calculateResults = useCallback(() => {
    // ✅ Проверяем, что выбраны ЖК и тип квартиры
    if (!formData.complex || !formData.apartmentType) {
      return;
    }
    calculate(formData);
  }, [formData, calculate]);

  // ============================================================
  // ВОЗВРАТ
  // ============================================================

  const offersCount = results?.bankResults.length ?? 0;

  return {
    // Данные
    results,
    offersCount,
    isCalculating,
    error,
    configLoading,

    // Форма
    formData,
    handleInputChange,

    // Выбор
    selectedOfferIndex,
    handleSelectOffer,

    // Фильтры
    _filtersRef: filtersRef,
    _updateFilters: updateFilters,
    _getFilters: getFiltersRef,

    // Действия
    calculateResults,
    clearCache,
    formatMoney,
  };
};
