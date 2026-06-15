import React, { useMemo, useState } from "react";
import type { BankProgramResult } from "../../../utils/types";
import "./OfferBankSection.css";

interface OfferBankSectionProps {
  bankResults: BankProgramResult[];
  selectedOfferIndex: number | null;
  onSelectOffer: (index: number) => void;
  formatMoney: (amount: number) => string;
  mortgageWithoutDownPayment?: boolean;
}

// Расширенный тип для хранения оригинального индекса
interface BankProgramResultWithIndex extends BankProgramResult {
  _originalIndex: number;
}

// Порядок банков для отображения
const BANK_ORDER = ["Сбербанк", "Альфа-Банк", "ВТБ", "Совкомбанк", "Уралсиб"];

// Порядок категорий для отображения
const CATEGORY_ORDER = [
  { key: "base", label: "🏠 Базовая ипотека", types: ["full"] },
  { key: "long", label: "📈 Субсидии на длинный срок", types: ["full"] },
  { key: "short", label: "⚡ Субсидии на короткий срок", types: ["short"] },
  { key: "family", label: "👨‍👩‍👧‍👦 Семейная ипотека", types: ["family"] },
  { key: "it", label: "💻 ИТ ипотека", types: ["it"] },
];

// Функция для определения категории программы
const getProgramCategory = (offer: BankProgramResultWithIndex): string => {
  // Базовая ипотека (без субсидии)
  if (offer.type === "full" && offer.subsidyAmount === 0) {
    return "base";
  }
  // Субсидии на длинный срок
  if (offer.type === "full" && offer.subsidyAmount > 0) {
    return "long";
  }
  // Субсидии на короткий срок
  if (offer.type === "short") {
    return "short";
  }
  // Семейная ипотека
  if (offer.type === "family") {
    return "family";
  }
  // ИТ ипотека
  if (offer.type === "it") {
    return "it";
  }
  return "base";
};

export const OfferBankSection: React.FC<OfferBankSectionProps> = ({
  bankResults,
  selectedOfferIndex,
  onSelectOffer,
  formatMoney,
  mortgageWithoutDownPayment = false,
}) => {
  const [showOverstatement, setShowOverstatement] = useState(true);
  // Группируем предложения по банкам и категориям
  const groupedData = useMemo(() => {
    const banks: Record<
      string,
      Record<string, BankProgramResultWithIndex[]>
    > = {};

    bankResults.forEach((offer, originalIndex) => {
      const offerWithIndex: BankProgramResultWithIndex = {
        ...offer,
        _originalIndex: originalIndex,
      };

      const bankName = offerWithIndex.bank;
      const category = getProgramCategory(offerWithIndex);

      if (!banks[bankName]) {
        banks[bankName] = {};
      }
      if (!banks[bankName][category]) {
        banks[bankName][category] = [];
      }
      banks[bankName][category].push(offerWithIndex);
    });

    return banks;
  }, [bankResults]);

  // Сортируем банки согласно порядку
  const sortedBanks = useMemo(() => {
    return Object.keys(groupedData).sort((a, b) => {
      const indexA = BANK_ORDER.indexOf(a);
      const indexB = BANK_ORDER.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [groupedData]);

  // Проверка, есть ли в категории программы
  const hasProgramsInCategory = (
    bankData: Record<string, BankProgramResultWithIndex[]>,
    categoryKey: string,
  ) => {
    return bankData[categoryKey] && bankData[categoryKey].length > 0;
  };

  return (
    <div className="results-section">
      <div>
        <h3 className="banks-header">
          Предложения банков ({bankResults.length})
        </h3>

        {/* Галочка для скрытия/показа строки "Завышение" */}
        <label className="toggle-overstatement">
          <input
            type="checkbox"
            checked={showOverstatement}
            onChange={(e) => setShowOverstatement(e.target.checked)}
          />
          <span>Показать завышение</span>
        </label>
      </div>

      {sortedBanks.map((bankName) => {
        const bankData = groupedData[bankName];

        // Проверяем, есть ли вообще программы в этом банке
        const hasAnyPrograms = Object.values(bankData).some(
          (arr) => arr.length > 0,
        );

        if (!hasAnyPrograms) return null;

        return (
          <div key={bankName} className="bank-group">
            <div className="bank-group-header">
              <h2 className="bank-group-title">🏦 {bankName}</h2>
              <span className="bank-group-count">
                {bankResults.filter((o) => o.bank === bankName).length} программ
              </span>
            </div>

            <div className="bank-categories">
              {CATEGORY_ORDER.map((category) => {
                if (!hasProgramsInCategory(bankData, category.key)) {
                  return null;
                }

                const programs = bankData[category.key];

                return (
                  <div key={category.key} className="category-group">
                    <div className="category-header">
                      <h3 className="category-title">{category.label}</h3>
                      <span className="category-count">
                        {programs.length} программ
                      </span>
                    </div>

                    <div className="banks-list">
                      {programs.map((offer) => (
                        <div
                          key={offer._originalIndex}
                          className={`bank-card ${
                            selectedOfferIndex === offer._originalIndex
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => onSelectOffer(offer._originalIndex)}
                        >
                          <div className="bank-card-header">
                            <div className="bank-info">
                              <h4>{offer.program}</h4>
                              <p className="bank-program">
                                {offer.type === "full" && "Весь срок"}
                                {offer.type === "short" &&
                                  `Короткий срок (${offer.durationMonths} мес)`}
                                {offer.type === "family" && "Семейная ипотека"}
                                {offer.type === "it" && "ИТ ипотека"}
                              </p>
                              {offer.rate && offer.rate > 0 && (
                                <p className="bank-rate">{offer.rate}%</p>
                              )}
                            </div>
                            <div className="payment-info">
                              <p className="payment-label">
                                Ежемесячный платёж
                              </p>
                              <p className="payment-value">
                                {formatMoney(offer.monthlyPayment)}
                              </p>
                            </div>
                          </div>

                          {/* Сетка деталей - одна колонка */}
                          <div className="bank-details-list">
                            {/* Показываем "Завышение" только если галочка включена */}
                            {showOverstatement && (
                              <div className="bank-detail-item">
                                <span className="bank-detail-label">
                                  Завышение:
                                </span>
                                <span className="bank-detail-value warning">
                                  {formatMoney(offer.overstatement)}
                                </span>
                              </div>
                            )}
                            <div className="bank-detail-item">
                              <span className="bank-detail-label">
                                Сумма в договоре:
                              </span>
                              <span className="bank-detail-value">
                                {formatMoney(offer.contractAmount)}
                              </span>
                            </div>
                            <div className="bank-detail-item">
                              <span className="bank-detail-label">
                                Сумма ПВ:
                              </span>
                              <span className="bank-detail-value">
                                {formatMoney(offer.downPaymentAmount)}
                              </span>
                            </div>
                            <div className="bank-detail-item">
                              <span className="bank-detail-label">
                                Собственные средства:
                              </span>
                              <span className="bank-detail-value">
                                {formatMoney(offer.ownFunds)}
                              </span>
                            </div>
                            {/* Показываем "Вносим за клиента" только при ипотеке без ПВ */}
                            {mortgageWithoutDownPayment && (
                              <div className="bank-detail-item">
                                <span className="bank-detail-label">
                                  Вносим за клиента:
                                </span>
                                <span className="bank-detail-value positive">
                                  {formatMoney(offer.clientContribution)}
                                </span>
                              </div>
                            )}
                            <div className="bank-detail-item">
                              <span className="bank-detail-label">ПВ в %:</span>
                              <span className="bank-detail-value">
                                {offer.downPaymentPercent.toFixed(1)}%
                              </span>
                            </div>
                            <div className="bank-detail-item">
                              <span className="bank-detail-label">
                                Ипотека:
                              </span>
                              <span className="bank-detail-value">
                                {formatMoney(offer.mortgageAmount)}
                              </span>
                            </div>
                            <div className="bank-detail-item">
                              <span className="bank-detail-label">
                                Сумма субсидии:
                              </span>
                              <span className="bank-detail-value positive">
                                {formatMoney(offer.subsidyAmount)}
                              </span>
                            </div>
                            <div className="bank-detail-item">
                              <span className="bank-detail-label">
                                На счет застройщика:
                              </span>
                              <span className="bank-detail-value">
                                {formatMoney(offer.developerAccount)}
                              </span>
                            </div>
                          </div>

                          {offer.durationMonths && offer.type === "short" && (
                            <div className="bank-duration">
                              Льготный период: {offer.durationMonths} месяцев
                            </div>
                          )}

                          {offer.excessLimit && offer.excessLimit > 0 && (
                            <div className="bank-excess">
                              Сверхлимит: {formatMoney(offer.excessLimit)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
