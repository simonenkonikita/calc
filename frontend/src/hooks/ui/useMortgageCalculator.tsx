// hooks/useMortgageCalculator.ts

import { useState, useCallback, useRef } from "react";
import { CalculatorFormData } from "../../utils/types";
import { formatMoney } from "../../utils/formatMoney";
import { DEFAULT_MIN_PV_PERCENT } from "../../data/constants";
import { defaultFormData } from "../../data/defaultFormData";
import { useMortgageData } from "../api/useMortgageData";

export const useMortgageCalculator = () => {
  const { results, isCalculating, error, calculate, clearCache } =
    useMortgageData();
  const [formData, setFormData] = useState<CalculatorFormData>(defaultFormData);
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number | null>(
    null,
  );

  // 🔥 Ref для восстановления выбранного оффера
  const selectedOfferRef = useRef<number | null>(null);

  // 🔥 Фильтры
  const filtersRef = useRef({
    selectedBankFilter: "all",
    selectedProgramTypeFilter: "all",
    selectedCards: new Set<number>(),
    showOverstatement: false,
  });

  /*   // 🔥 Автоматический расчет при изменении формы
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Дебаунс для избегания частых запросов
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      calculate(formData);
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [formData, calculate]); */

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
          newData.downPaymentPercent = DEFAULT_MIN_PV_PERCENT;
          newData.mortgagePartialDownPayment = false;
        }

        if (field === "mortgagePartialDownPayment" && value === true) {
          newData.downPaymentPercent = DEFAULT_MIN_PV_PERCENT;
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
            downPaymentPercent: DEFAULT_MIN_PV_PERCENT,
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
    [],
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
  // РУЧНОЙ ПЕРЕСЧЕТ
  // ============================================================

  const calculateResults = useCallback(() => {
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
