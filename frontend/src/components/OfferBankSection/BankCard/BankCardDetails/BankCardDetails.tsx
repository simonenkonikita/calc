// src/components/BankCard/BankCardDetails.tsx
import React from "react";
import { BankProgramResultWithIndex } from "../../../../utils/types";

interface BankCardDetailsProps {
  offer: BankProgramResultWithIndex;
  showOverstatement: boolean;
  isSpecialMortgageMode: boolean;
  isTwoContracts: boolean;
  formatMoney: (amount: number) => string;
}

export const BankCardDetails: React.FC<BankCardDetailsProps> = ({
  offer,
  showOverstatement,
  isSpecialMortgageMode,
  isTwoContracts,
  formatMoney,
}) => {
  const area = offer.area ?? 0;

  // Вспомогательная функция для форматирования значений
  const formatValue = (value: any): string => {
    if (value === undefined || value === null) return "—";
    if (typeof value === "string" && value.includes("%")) return value;
    if (typeof value === "number") {
      // Если это проценты или дата, возвращаем как есть
      if (value.toString().includes("%")) return value.toString();
      return formatMoney(value);
    }
    return String(value);
  };

  const detailItems = [
    ...(showOverstatement
      ? [
          {
            label: "Завышение:",
            value: offer.overstatement,
            className: "warning",
          },
        ]
      : []),
    { label: "Сумма в договоре:", value: offer.contractAmount },
    { label: "Сумма ПВ:", value: offer.downPaymentAmount },
    ...(isSpecialMortgageMode
      ? [
          { label: "Собственные средства:", value: offer.ownFunds },
          {
            label: "Вносим за клиента:",
            value: offer.clientContribution,
            className: "positive",
          },
        ]
      : []),
    {
      label: "ПВ в %:",
      value: `${offer.downPaymentPercent?.toFixed(1) || 0}%`,
    },
    { label: "Ипотека:", value: offer.mortgageAmount },
    ...(isTwoContracts
      ? [
          {
            label: "Ипотека (договор 1):",
            value: offer.firstContractAmount || offer.mortgageAmount || 0,
          },
          {
            label: "Ипотека (договор 2):",
            value: offer.secondContractAmount || 0,
          },
        ]
      : []),
    ...(offer.type === "tranche" && offer.isTranche
      ? [
          { label: "Первый транш:", value: offer.firstTrancheAmount || 0 },
          { label: "Второй транш:", value: offer.secondTrancheAmount || 0 },
          ...(offer.trancheSecondDate
            ? [
                {
                  label: "Дата второго транша:",
                  value: new Date(offer.trancheSecondDate).toLocaleDateString(
                    "ru-RU",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    },
                  ),
                },
              ]
            : []),
          ...(offer.monthsUntilSecondTranche !== undefined &&
          offer.monthsUntilSecondTranche !== null
            ? [
                {
                  label: "До второго транша:",
                  value: `${offer.monthsUntilSecondTranche} мес`,
                },
              ]
            : []),
        ]
      : []),
    ...(showOverstatement
      ? [
          {
            label: "Сумма субсидии:",
            value: offer.subsidyAmount || 0,
            className: "positive",
          },
          {
            label: "Субсидия в %:",
            value: `${Number(offer.subsidyPercent)?.toFixed(2) || 0}%`,
            className: "positive",
          },
        ]
      : []),
    { label: "На счет застройщика:", value: offer.developerAccount || 0 },
    {
      label: "Площадь объекта:",
      value: area > 0 ? `${area} м²` : "—",
    },
    {
      label: "Получено за м²:",
      value:
        offer.pricePerM2 !== null &&
        offer.pricePerM2 !== undefined &&
        offer.pricePerM2 > 0
          ? formatMoney(offer.pricePerM2)
          : "—",
    },
  ];

  return (
    <div className="bank-details-list">
      {detailItems.map((item, index) => (
        <div key={index} className="bank-detail-item">
          <span className="bank-detail-label">{item.label}</span>
          <span className={`bank-detail-value ${item.className || ""}`}>
            {formatValue(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
};
