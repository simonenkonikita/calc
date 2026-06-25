import React, { useMemo, useState } from "react";
import type {
  BankProgramResultWithIndex,
  OfferBankSectionProps,
} from "../../../utils/types";
import "./OfferBankSection.css";
import "./BankCardBadge.css";
import {
  BANK_ORDER,
  CATEGORY_ORDER,
  PROGRAM_TYPE_LABELS,
} from "../../../utils/constants";
import { formatOfferToText } from "../../../hooks/addHooks/formatOfferToText";
import { safeFormatMoney } from "../../../hooks/addHooks/formatMoney";
import { getBadge } from "../../../utils/getBadge";

// Функция для определения категории программы
const getProgramCategory = (offer: BankProgramResultWithIndex): string => {
  if (offer.type === "full" && offer.subsidyAmount === 0) {
    return "base";
  }
  if (offer.type === "full" && offer.subsidyAmount > 0) {
    return "long";
  }
  if (offer.type === "short") {
    return "short";
  }
  if (offer.type === "family") {
    return "family";
  }
  if (offer.type === "it") {
    return "it";
  }
  return "base";
};

export const OfferBankSection: React.FC<OfferBankSectionProps> = ({
  bankResults,
  onSelectOffer,
  formatMoney,
  mortgageWithoutDownPayment = false,
  mortgagePartialDownPayment = false,
  loanTermYears,
}) => {
  const [showOverstatement, setShowOverstatement] = useState(false);
  const [selectedBankFilter, setSelectedBankFilter] = useState<string>("all");
  const [selectedProgramTypeFilter, setSelectedProgramTypeFilter] =
    useState<string>("all");
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [copySuccess, setCopySuccess] = useState(false);

  const isSpecialMortgageMode = useMemo(() => {
    return mortgageWithoutDownPayment || mortgagePartialDownPayment;
  }, [mortgageWithoutDownPayment, mortgagePartialDownPayment]);

  const uniqueBanks = useMemo(() => {
    return Array.from(new Set(bankResults.map((offer) => offer.bank)));
  }, [bankResults]);

  const uniqueProgramTypes = useMemo(() => {
    const types = new Set(bankResults.map((offer) => offer.type));
    return Array.from(types);
  }, [bankResults]);

  const isFiltersActive = useMemo(() => {
    return selectedBankFilter !== "all" || selectedProgramTypeFilter !== "all";
  }, [selectedBankFilter, selectedProgramTypeFilter]);

  const filteredBankResults = useMemo(() => {
    let filtered = bankResults;

    if (selectedBankFilter !== "all") {
      filtered = filtered.filter((offer) => offer.bank === selectedBankFilter);
    }

    if (selectedProgramTypeFilter !== "all") {
      filtered = filtered.filter(
        (offer) => offer.type === selectedProgramTypeFilter,
      );
    }

    return filtered;
  }, [bankResults, selectedBankFilter, selectedProgramTypeFilter]);

  const groupedData = useMemo(() => {
    const banks: Record<
      string,
      Record<string, BankProgramResultWithIndex[]>
    > = {};

    filteredBankResults.forEach((offer, originalIndex) => {
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
  }, [filteredBankResults]);

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

  const hasProgramsInCategory = (
    bankData: Record<string, BankProgramResultWithIndex[]>,
    categoryKey: string,
  ) => {
    return bankData[categoryKey] && bankData[categoryKey].length > 0;
  };

  const resetFilters = () => {
    setSelectedBankFilter("all");
    setSelectedProgramTypeFilter("all");
  };

  const getProgramTypeLabel = (type: string): string => {
    return PROGRAM_TYPE_LABELS[type] || type;
  };

  const toggleCardSelection = (index: number) => {
    setSelectedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleCardClick = (index: number) => {
    toggleCardSelection(index);
    onSelectOffer(index);
  };

  const copySelectedOffers = () => {
    if (selectedCards.size === 0) return;

    const selectedResults = filteredBankResults.filter((_, idx) =>
      selectedCards.has(idx),
    );

    const texts = selectedResults.map((offer) =>
      formatOfferToText(
        offer,
        formatMoney,
        showOverstatement,
        isSpecialMortgageMode,
        loanTermYears,
      ),
    );

    const fullText = texts.join("\n\n---\n\n");

    navigator.clipboard
      .writeText(fullText)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      })
      .catch(() => {
        const textarea = document.createElement("textarea");
        textarea.value = fullText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      });
  };

  const selectAllCards = () => {
    const allIndices = filteredBankResults.map((_, idx) => idx);
    setSelectedCards(new Set(allIndices));
  };

  const deselectAllCards = () => {
    setSelectedCards(new Set());
  };

  return (
    <div className="results-section">
      <div>
        <div className="banks-header-wrapper">
          <h3 className="banks-header">
            Предложения банков ({filteredBankResults.length})
          </h3>

          <div className="banks-filters">
            <select
              className="bank-filter-select"
              value={selectedBankFilter}
              onChange={(e) => setSelectedBankFilter(e.target.value)}
            >
              <option value="all">Все банки ({uniqueBanks.length})</option>

              {uniqueBanks.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>

            <select
              className="bank-filter-select"
              value={selectedProgramTypeFilter}
              onChange={(e) => setSelectedProgramTypeFilter(e.target.value)}
            >
              <option value="all">Все типы</option>
              {uniqueProgramTypes.map((type) => (
                <option key={type} value={type}>
                  {getProgramTypeLabel(type)}
                </option>
              ))}
            </select>

            <button
              className={`reset-filters-btn ${isFiltersActive ? "active" : "inactive"}`}
              onClick={resetFilters}
              disabled={!isFiltersActive}
            >
              <span>✕</span> Очистить
            </button>

            <label className="toggle-overstatement">
              <input
                type="checkbox"
                checked={showOverstatement}
                onChange={(e) => setShowOverstatement(e.target.checked)}
              />
              <span>Показать завышение и субсидию</span>
            </label>
          </div>
        </div>
      </div>

      {sortedBanks.length === 0 ? (
        <div className="no-results">
          <p>😕 Нет предложений, соответствующих фильтрам</p>
          <button onClick={resetFilters}>Сбросить фильтры</button>
        </div>
      ) : (
        sortedBanks.map((bankName) => {
          const bankData = groupedData[bankName];

          const hasAnyPrograms = Object.values(bankData).some(
            (arr) => arr.length > 0,
          );

          if (!hasAnyPrograms) return null;

          return (
            <div key={bankName} className="bank-group">
              <div className="bank-group-header">
                <h2 className="bank-group-title">🏦 {bankName}</h2>
                <span className="bank-group-count">
                  {
                    filteredBankResults.filter((o) => o.bank === bankName)
                      .length
                  }
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
                      </div>

                      <div className="banks-list">
                        {programs.map((offer) => {
                          const isSelected = selectedCards.has(
                            offer._originalIndex,
                          );
                          const isShortWithSubsidy =
                            offer.type === "short" &&
                            offer.monthlyPaymentAfter !== undefined &&
                            offer.monthlyPaymentAfter !== null;

                          const badge = getBadge(offer);

                          return (
                            <div
                              key={offer._originalIndex}
                              className={`bank-card ${
                                isSelected ? "selected" : ""
                              }`}
                              onClick={() =>
                                handleCardClick(offer._originalIndex)
                              }
                            >
                              {/* ✅ Шильдик поверх карточки (правый верхний угол) */}
                              {badge && (
                                <div className="bank-card-badge badge-promo">
                                  <span className="badge-icon">🎯</span>
                                  <span className="badge-text">{badge}</span>
                                </div>
                              )}

                              <div className="bank-card-header">
                                <div className="bank-info">
                                  <p className="bank-program">
                                    {offer.type === "full" && "Весь срок"}
                                    {offer.type === "short" &&
                                      `Короткий срок (${offer.durationMonths} мес)`}
                                    {offer.type === "family" &&
                                      "Семейная ипотека"}
                                    {offer.type === "it" && "ИТ ипотека"}
                                  </p>
                                  {/* Ставки - унифицированный стиль */}
                                  {isShortWithSubsidy ? (
                                    <div className="bank-rates">
                                      <span className="bank-rate">
                                        {offer.shortRate || offer.rate}% →{" "}
                                        {offer.rate}%
                                      </span>
                                    </div>
                                  ) : (
                                    offer.rate &&
                                    offer.rate > 0 && (
                                      <p className="bank-rate">{offer.rate}%</p>
                                    )
                                  )}
                                </div>

                                {/* Унифицированный блок платежей */}
                                <div className="payment-info">
                                  <p className="payment-label">
                                    Ежемесячный платёж
                                  </p>
                                  {isShortWithSubsidy ? (
                                    <div className="payment-values-wrapper">
                                      <p className="payment-value payment-with-subsidy">
                                        {formatMoney(offer.monthlyPayment)}
                                      </p>
                                      <p className="payment-value payment-after-subsidy">
                                        →{" "}
                                        {safeFormatMoney(
                                          offer.monthlyPaymentAfter,
                                        )}
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="payment-value">
                                      {formatMoney(offer.monthlyPayment)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="bank-details-list">
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
                                {isSpecialMortgageMode && (
                                  <>
                                    <div className="bank-detail-item">
                                      <span className="bank-detail-label">
                                        Собственные средства:
                                      </span>
                                      <span className="bank-detail-value">
                                        {formatMoney(offer.ownFunds)}
                                      </span>
                                    </div>
                                    <div className="bank-detail-item">
                                      <span className="bank-detail-label">
                                        Вносим за клиента:
                                      </span>
                                      <span className="bank-detail-value positive">
                                        {formatMoney(offer.clientContribution)}
                                      </span>
                                    </div>
                                  </>
                                )}
                                <div className="bank-detail-item">
                                  <span className="bank-detail-label">
                                    ПВ в %:
                                  </span>
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
                                {showOverstatement && (
                                  <div className="bank-detail-item">
                                    <span className="bank-detail-label">
                                      Сумма субсидии:
                                    </span>
                                    <span className="bank-detail-value positive">
                                      {formatMoney(offer.subsidyAmount)}
                                    </span>
                                  </div>
                                )}
                                <div className="bank-detail-item">
                                  <span className="bank-detail-label">
                                    На счет застройщика:
                                  </span>
                                  <span className="bank-detail-value">
                                    {formatMoney(offer.developerAccount)}
                                  </span>
                                </div>
                              </div>

                              {offer.excessLimit && offer.excessLimit > 0 && (
                                <div className="bank-excess">
                                  Сверхлимит: {formatMoney(offer.excessLimit)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Плавающий бар снизу */}
      {selectedCards.size > 0 && (
        <div className="floating-selection-bar">
          <div className="floating-bar-content">
            <span className="selection-count">
              Выбрано: {selectedCards.size}
            </span>
            <button className="select-all-btn" onClick={selectAllCards}>
              Выбрать все
            </button>
            <button className="select-all-btn" onClick={deselectAllCards}>
              Снять все
            </button>
            <button className="copy-selected-btn" onClick={copySelectedOffers}>
              {copySuccess ? "✅ Скопировано!" : "📋 Копировать выбранные"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
