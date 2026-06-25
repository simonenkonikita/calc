/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  CalculatorFormData,
  ObjectCalculationResult,
  BankProgramResult,
} from "../utils/types";
import { bankOffers } from "../data/bankOffers";
import { housingPrices } from "../data/calculatorData";
import { variables } from "../data/limitdDate";
import { calculateFullMortgage } from "./resultForm/calculateFullMortgage";
import { formatMoney } from "./addHooks/formatMoney";
import {
  DEFAULT_LOAN_TERM_YEARS,
  DEFAULT_MIN_PV_PERCENT,
  MORTGAGE_PARTIAL_DOWN_PAYMENT_SURCHARGES,
  MORTGAGE_WITHOUT_DOWN_PAYMENT_SURCHARGES,
  PRICE_PER_SQUARE_METER_DEFAULT,
} from "../utils/constants";
// Функция для получения цены за м2
const getPricePerSquareMeter = (
  complexName: string,
  apartmentType: string,
): number => {
  // Если нет данных, возвращаем значение по умолчанию
  if (!complexName || !apartmentType) {
    console.warn("Не указан ЖК или тип квартиры");
    return PRICE_PER_SQUARE_METER_DEFAULT;
  }

  const found = housingPrices.find(
    (item) =>
      item.complexName === complexName && item.apartmentType === apartmentType,
  );

  if (!found) {
    console.warn(`Цена не найдена для ${complexName} - ${apartmentType}`);
    return PRICE_PER_SQUARE_METER_DEFAULT;
  }

  return found.pricePerSquareMeter;
};

// Функция для получения наценки за ипотеку без ПВ для конкретного ЖК
// Функция для получения наценки в зависимости от типа ипотеки
const getMortgageSurcharge = (
  complexName: string,
  mortgageWithoutDownPayment: boolean,
  mortgagePartialDownPayment: boolean,
): number => {
  if (!complexName) return 0;

  // Приоритет: сначала ипотека без ПВ, потом частичный ПВ
  if (mortgageWithoutDownPayment) {
    const surcharge = MORTGAGE_WITHOUT_DOWN_PAYMENT_SURCHARGES[complexName];
    return surcharge ?? 0;
  }

  if (mortgagePartialDownPayment) {
    const surcharge = MORTGAGE_PARTIAL_DOWN_PAYMENT_SURCHARGES[complexName];
    return surcharge ?? 0;
  }

  return 0;
};

export const useMortgageCalculator = () => {
  const [formData, setFormData] = useState<CalculatorFormData>({
    complex: "ЖК Сады у моря",
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
    applyMinDownPayment: false,
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

  // Мемоизируем pricePerM2 для избежания лишних перерасчётов
  const basePricePerM2 = useMemo(() => {
    if (!formData.complex || !formData.apartmentType) return null;
    return getPricePerSquareMeter(formData.complex, formData.apartmentType);
  }, [formData.complex, formData.apartmentType]);

  // Получаем наценку для текущего ЖК
  const surchargePerM2 = useMemo(() => {
    if (!formData.complex) return 0;
    return getMortgageSurcharge(
      formData.complex,
      formData.mortgageWithoutDownPayment,
      formData.mortgagePartialDownPayment,
    );
  }, [
    formData.complex,
    formData.mortgageWithoutDownPayment,
    formData.mortgagePartialDownPayment,
  ]);

  // Финальная цена с учётом ипотеки без ПВ или частичного ПВ
  const finalPricePerM2 = useMemo(() => {
    if (basePricePerM2 === null) return null;
    // Если включена ипотека без ПВ ИЛИ частичный ПВ
    if (
      formData.mortgageWithoutDownPayment ||
      formData.mortgagePartialDownPayment
    ) {
      return basePricePerM2 + surchargePerM2;
    }
    return basePricePerM2;
  }, [
    basePricePerM2,
    formData.mortgageWithoutDownPayment,
    formData.mortgagePartialDownPayment,
    surchargePerM2,
  ]);
  const calculateResults = useCallback(async () => {
    setIsCalculating(true);
    setError(null);

    try {
      // Небольшая задержка для имитации загрузки (опционально)
      // await new Promise(resolve => setTimeout(resolve, 100));

      const calculated = calculateFullMortgage(
        formData,
        bankOffers,
        variables,
        finalPricePerM2 ?? PRICE_PER_SQUARE_METER_DEFAULT,
      );

      setResults(calculated);

      // Сбрасываем выбранное предложение при новом расчёте
      setSelectedOfferIndex(null);
    } catch (err) {
      console.error("Ошибка при расчёте:", err);
      setError("Произошла ошибка при расчёте. Попробуйте изменить параметры.");
      setResults(null);
    } finally {
      setIsCalculating(false);
    }
  }, [formData, finalPricePerM2]);

  // Запускаем расчёт при изменении зависимостей
  useEffect(() => {
    calculateResults();
  }, [calculateResults]);

  const handleInputChange = useCallback(
    <K extends keyof CalculatorFormData>(
      field: K,
      value: CalculatorFormData[K],
    ) => {
      setFormData((prev) => {
        // Специальная обработка для связанных полей
        let newData = { ...prev, [field]: value };

        // ✅ Если включена "Ипотека без ПВ"
        if (field === "mortgageWithoutDownPayment" && value === true) {
          newData.downPaymentPercent = DEFAULT_MIN_PV_PERCENT;
          // Если включена ипотека без ПВ, отключаем частичный ПВ
          newData.mortgagePartialDownPayment = false;
          console.log(
            `🏷️ Ипотека без ПВ - ПВ сброшен до ${DEFAULT_MIN_PV_PERCENT}%`,
          );
        }

        // ✅ Если включена "Ипотека с частичным ПВ"
        if (field === "mortgagePartialDownPayment" && value === true) {
          newData.downPaymentPercent = DEFAULT_MIN_PV_PERCENT;
          // Если включен частичный ПВ, отключаем ипотеку без ПВ
          newData.mortgageWithoutDownPayment = false;
          console.log(
            `🏷️ Ипотека с частичным ПВ - ПВ сброшен до ${DEFAULT_MIN_PV_PERCENT}%`,
          );
        }

        // ✅ Если поле downPaymentPercent изменяется вручную, но включена "Ипотека без ПВ" или "Частичный ПВ" - отменяем изменение
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

        // ✅ Если ручной ввод ПВ больше 0, сбрасываем ПВ в % до 20.1%
        if (
          field === "manualDownPayment" &&
          typeof value === "number" &&
          value > 0
        ) {
          newData = {
            ...newData,
            downPaymentPercent: DEFAULT_MIN_PV_PERCENT,
          };
          console.log(
            `✏️ Ручной ввод ПВ (${value} ₽) - ПВ в % сброшен до ${DEFAULT_MIN_PV_PERCENT}%`,
          );
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

  // Подсчёт количества предложений
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
