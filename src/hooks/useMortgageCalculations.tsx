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
import { calculateFullMortgage } from "./calculateFullMortgage";
import { formatMoney } from "./formatMoney";
import {
  DEFAULT_LOAN_TERM_YEARS,
  MORTGAGE_WITHOUT_DOWN_PAYMENT_SURCHARGE,
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

export const useMortgageCalculator = () => {
  const [formData, setFormData] = useState<CalculatorFormData>({
    complex: "ЖК Сады у моря",
    apartmentType: "Двухкомнатная квартира",
    area: 30,
    manualObjectCost: null,
    considerDepositInCost: false,
    downPaymentPercent: 20.1,
    manualDownPayment: 0,
    loanTerm: DEFAULT_LOAN_TERM_YEARS,
    projectFinancingBank: "Сбербанк",
    noSubsidyInflate: false,
    mortgageWithoutDownPayment: false,
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

  // Финальная цена с учётом ипотеки без ПВ
  const finalPricePerM2 = useMemo(() => {
    if (basePricePerM2 === null) return null;
    if (formData.mortgageWithoutDownPayment) {
      return basePricePerM2 + MORTGAGE_WITHOUT_DOWN_PAYMENT_SURCHARGE;
    }
    return basePricePerM2;
  }, [basePricePerM2, formData.mortgageWithoutDownPayment]);

  const calculateResults = useCallback(async () => {
    // Валидация
    if (formData.area <= 0) {
      setError("Площадь должна быть больше 0");
      return;
    }

    if (!formData.complex || !formData.apartmentType) {
      setError("Выберите жилой комплекс и тип квартиры");
      return;
    }

    if (finalPricePerM2 === null) {
      setError("Не удалось определить цену за м²");
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      // Небольшая задержка для имитации загрузки (опционально)
      // await new Promise(resolve => setTimeout(resolve, 100));

      console.log("Расчёт с параметрами:", {
        complex: formData.complex,
        apartmentType: formData.apartmentType,
        area: formData.area,
        pricePerM2: finalPricePerM2,
        mortgageWithoutDownPayment: formData.mortgageWithoutDownPayment,
      });

      const calculated = calculateFullMortgage(
        formData,
        bankOffers,
        variables,
        finalPricePerM2,
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
        if (field === "mortgageWithoutDownPayment" && value === true) {
          console.log(
            `Включена ипотека без ПВ - цена за м² увеличена на ${MORTGAGE_WITHOUT_DOWN_PAYMENT_SURCHARGE.toLocaleString()} ₽`,
          );
        }
        return { ...prev, [field]: value };
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
