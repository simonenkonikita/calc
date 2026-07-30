// hooks/useMortgageCalculator.ts
import { useState, useEffect, useCallback, useRef } from "react";
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

  // Для отмены предыдущих запросов
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

      // Если запрос был отменён — игнорируем результат
      if (controller.signal.aborted) return;

      if (response.success) {
        setResults(response.data);
        setSelectedOfferIndex(null);
      } else {
        throw new Error(response.error || "Unknown error");
      }
    } catch (err) {
      // Игнорируем ошибки отменённых запросов
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
  // ДЕБАУНС ДЛЯ ЗАПРОСОВ (чтобы не дёргать API при каждом нажатии)
  // ============================================================
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCalculate = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      calculateResults();
    }, 300); // Задержка 300ms
  }, [calculateResults]);

  // ============================================================
  // АВТОЗАПУСК РАСЧЕТА ПРИ ИЗМЕНЕНИИ ФОРМЫ
  // ============================================================
  useEffect(() => {
    debouncedCalculate();

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedCalculate]);

  // ============================================================
  // ОБРАБОТЧИКИ ИЗМЕНЕНИЙ
  // ============================================================
  const handleInputChange = useCallback(
    <K extends keyof CalculatorFormData>(
      field: K,
      value: CalculatorFormData[K],
    ) => {
      setFormData((prev) => {
        let newData = { ...prev, [field]: value };

        // Если включена "ипотека без ПВ"
        if (field === "mortgageWithoutDownPayment" && value === true) {
          newData.downPaymentPercent = DEFAULT_MIN_PV_PERCENT;
          newData.mortgagePartialDownPayment = false;
        }

        // Если включена "частичная ипотека"
        if (field === "mortgagePartialDownPayment" && value === true) {
          newData.downPaymentPercent = DEFAULT_MIN_PV_PERCENT;
          newData.mortgageWithoutDownPayment = false;
        }

        // Если меняют ПВ, а включены спецрежимы — блокируем
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

        // Если ручной ввод ПВ — сбрасываем процент
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
    },
    [],
  );

  const handleSelectOffer = useCallback(
    (index: number) => {
      setSelectedOfferIndex(index);
      if (results?.bankResults[index]) {
        const selected = results.bankResults[index];
        console.log("Выбрано предложение:", {
          bank: selected.bank,
          program: selected.program,
          monthlyPayment: selected.monthlyPayment,
          contractAmount: selected.contractAmount,
        });
      }
    },
    [results],
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
  };
};
