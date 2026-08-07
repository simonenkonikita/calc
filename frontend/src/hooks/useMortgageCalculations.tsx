// hooks/useMortgageCalculations.ts
import { useState, useCallback, useRef } from "react";
import type {
  CalculatorFormData,
  ObjectCalculationResult,
  BankProgramResult,
} from "../utils/types";
import { api } from "../services/api";
import { formatMoney } from "../utils/formatMoney";
import {
  DEFAULT_LOAN_TERM_YEARS,
  DEFAULT_MIN_PV_PERCENT,
} from "../data/constants";

export const useMortgageCalculator = () => {
  const [formData, setFormData] = useState<CalculatorFormData>({
    complex: "ЖК Сады у моря 3",
    apartmentType: "Студия",
    area: 30,
    manualObjectCost: null,
    considerDepositInCost: false,
    downPaymentPercent: 20.1,
    manualDownPayment: 0,
    loanTerm: DEFAULT_LOAN_TERM_YEARS,
    projectFinancingBank: "Сбербанк",
    noSubsidyInflate: false,
    mortgageWithoutDownPayment: false,
    mortgagePartialDownPayment: false,
  });

  const [results, setResults] = useState<{
    objectResult: ObjectCalculationResult;
    bankResults: BankProgramResult[];
  } | null>(null);

  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number | null>(
    null,
  );

  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Сохраняем выбранный оффер и фильтры между перерасчётами
  const selectedOfferRef = useRef<number | null>(null);

  const filtersRef = useRef<{
    selectedBankFilter: string;
    selectedProgramTypeFilter: string;
    selectedCards: Set<number>;
  }>({
    selectedBankFilter: "all",
    selectedProgramTypeFilter: "all",
    selectedCards: new Set(),
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // ============================================================
  // РАСЧЕТ ЧЕРЕЗ API
  // ============================================================
  const calculateResults = useCallback(async () => {
    // Отменяем предыдущий запрос, если он ещё идёт
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsCalculating(true);
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await api.calculate(formData);

      if (controller.signal.aborted) return;

      if (response.success) {
        setResults(response.data);
        // ✅ Восстанавливаем выбранный оффер, если он ещё существует
        if (selectedOfferRef.current !== null) {
          const maxIndex = response.data.bankResults.length - 1;
          if (selectedOfferRef.current <= maxIndex) {
            setSelectedOfferIndex(selectedOfferRef.current);
          } else {
            setSelectedOfferIndex(null);
            selectedOfferRef.current = null;
          }
        }
      } else {
        throw new Error(response.error || "Unknown error");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      console.error("Ошибка при расчёте:", err);
      setError(
        err instanceof Error ? err.message : "Произошла ошибка при расчёте",
      );
      setResults(null);
    } finally {
      if (!controller.signal.aborted) {
        setIsCalculating(false);
      }
    }
  }, [formData]);

  // ============================================================
  // ОБРАБОТЧИКИ ИЗМЕНЕНИЙ (только форма, без перерасчёта)
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

      // ✅ Сбрасываем выбранный оффер только при изменении ключевых параметров
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
        // Сбрасываем выбранные карточки в фильтрах
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
  // ФУНКЦИИ ДЛЯ УПРАВЛЕНИЯ ФИЛЬТРАМИ
  // ============================================================
  const getFiltersRef = useCallback(() => filtersRef.current, []);

  const updateFilters = useCallback(
    (updates: Partial<typeof filtersRef.current>) => {
      filtersRef.current = { ...filtersRef.current, ...updates };
    },
    [],
  );

  // ============================================================
  // ВОЗВРАТ
  // ============================================================
  const offersCount = results?.bankResults.length ?? 0;

  return {
    formData,
    results,
    selectedOfferIndex,
    offersCount,
    isCalculating,
    error,
    handleInputChange,
    handleSelectOffer,
    formatMoney,
    calculateResults, // ✅ Добавляем функцию для ручного расчёта
    _filtersRef: filtersRef,
    _updateFilters: updateFilters,
    _getFilters: getFiltersRef,
  };
};
