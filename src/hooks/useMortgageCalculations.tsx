/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  CalculatorFormData,
  ObjectCalculationResult,
  BankProgramResult,
} from "../utils/types";
import { bankOffers } from "../data/banks";
import { housingPrices } from "../data/calculatorData";
import { variables } from "../data/limitdDate";
import { calculateFullMortgage } from "../services/calculations/result/calculateFullMortgage";
import { formatMoney } from "../utils/formatMoney";
import {
  DEFAULT_LOAN_TERM_YEARS,
  DEFAULT_MIN_PV_PERCENT,
  MORTGAGE_PARTIAL_DOWN_PAYMENT_SURCHARGES,
  MORTGAGE_WITHOUT_DOWN_PAYMENT_SURCHARGES,
  PRICE_PER_SQUARE_METER_DEFAULT,
} from "../utils/constants";
import { filterBankOffersByComplex } from "../utils/filterBankOffers";

// Функция для получения цены за м2
const getPricePerSquareMeter = (
  complexName: string,
  apartmentType: string,
): number => {
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

// Функция для получения наценки
const getMortgageSurcharge = (
  complexName: string,
  mortgageWithoutDownPayment: boolean,
  mortgagePartialDownPayment: boolean,
): number => {
  if (!complexName) return 0;

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

  // ============================================================
  // 1. ЦЕНА ЗА М²
  // ============================================================
  const basePricePerM2 = useMemo(() => {
    if (!formData.complex || !formData.apartmentType) return null;
    return getPricePerSquareMeter(formData.complex, formData.apartmentType);
  }, [formData.complex, formData.apartmentType]);

  // ============================================================
  // 2. НАЦЕНКА
  // ============================================================
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

  // ============================================================
  // 3. ФИНАЛЬНАЯ ЦЕНА
  // ============================================================
  const finalPricePerM2 = useMemo(() => {
    if (basePricePerM2 === null) return null;
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

  // ============================================================
  // 4. 🔥 ФИЛЬТРУЕМ БАНКОВСКИЕ ПРЕДЛОЖЕНИЯ ПО ЖК
  // ============================================================
  const filteredBankOffers = useMemo(() => {
    if (!formData.complex || !formData.apartmentType) {
      return bankOffers;
    }

    return filterBankOffersByComplex({
      bankOffers,
      complexName: formData.complex,
      apartmentType: formData.apartmentType,
      housingPrices,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.complex, formData.apartmentType]);

  // ============================================================
  // 5. 🔥 РАСЧЕТ С ИСПОЛЬЗОВАНИЕМ ОТФИЛЬТРОВАННЫХ ПРЕДЛОЖЕНИЙ
  // ============================================================
  const calculateResults = useCallback(async () => {
    setIsCalculating(true);
    setError(null);

    try {
      const calculated = calculateFullMortgage(
        formData,
        filteredBankOffers, // 🔥 Используем отфильтрованные предложения
        variables,
        finalPricePerM2 ?? PRICE_PER_SQUARE_METER_DEFAULT,
      );

      setResults(calculated);
      setSelectedOfferIndex(null);
    } catch (err) {
      console.error("Ошибка при расчёте:", err);
      setError("Произошла ошибка при расчёте. Попробуйте изменить параметры.");
      setResults(null);
    } finally {
      setIsCalculating(false);
    }
  }, [formData, filteredBankOffers, finalPricePerM2]);

  // ============================================================
  // 6. ЗАПУСК РАСЧЕТА
  // ============================================================
  useEffect(() => {
    calculateResults();
  }, [calculateResults]);

  // ============================================================
  // 7. ОБРАБОТЧИКИ
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
  // 8. ВОЗВРАТ
  // ============================================================
  const offersCount = results?.bankResults.length ?? 0;

  return {
    formData,
    results,
    selectedOfferIndex,
    offersCount,
    isCalculating,
    error,
    filteredBankOffers,
    handleInputChange,
    handleSelectOffer,
    formatMoney,
  };
};
