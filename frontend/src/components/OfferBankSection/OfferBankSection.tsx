// OfferBankSection.tsx

import React, { useMemo, useState, useEffect } from "react";
import type {
  BankProgramResultWithIndex,
  OfferBankSectionProps,
} from "../../utils/types";
import "./OfferBankSection.css";

import { getProgramCategory } from "../../utils/category/getProgramCategory";

import { BankFilters } from "./BankFilters/BankFilters";
import { NoResults } from "./NoResults/NoResults";
import { BankGroup } from "./BankCard/BankGroup/BankGroup";
import { FloatingSelectionBar } from "./FloatingSelectionBar/FloatingSelectionBar";
import { BANK_ORDER } from "../../utils/constants";
import { getDisplayRate, getDisplaySubsidy } from "../../utils/offerHelpers";
import { useDynamicOffersData } from "../../hooks/api/useDynamicOffersData";

export const OfferBankSection: React.FC<OfferBankSectionProps> = ({
  bankResults,
  onSelectOffer,
  formatMoney,
  mortgageWithoutDownPayment = false,
  mortgagePartialDownPayment = false,
  loanTermYears,
  area,
  complexName,
  // 🔥 Фильтры из пропсов
  selectedBankFilter,
  selectedProgramTypeFilter,
  showOverstatement,
  onBankFilterChange,
  onProgramTypeFilterChange,
  onToggleOverstatement,
  onResetFilters,
  filtersRef,
}) => {
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());

  // 🔥 Загружаем динамические данные
  const { offers, dynamicDataMap, loading } = useDynamicOffersData();

  // 🔥 Создаем индекс для быстрого поиска по ID
  const offerIndex = useMemo(() => {
    const index = new Map<string, any>();
    offers.forEach((offer) => {
      index.set(offer.id, offer);
    });
    return index;
  }, [offers]);

  // 🔥 Функция получения динамических данных по offerId
  const getDynamicDataForOffer = useMemo(() => {
    return (bankResult: BankProgramResultWithIndex) => {
      if (!offers.length || !dynamicDataMap) return null;

      // 🔥 1. Ищем по offerId (основной способ)
      if (bankResult.offerId) {
        const offer = offerIndex.get(bankResult.offerId);
        if (offer) {
          const rateResult = getDisplayRate(offer, dynamicDataMap);
          const subsidyResult = getDisplaySubsidy(offer, dynamicDataMap);

          return {
            dynamicRateData:
              rateResult.type === "dynamic" && rateResult.details
                ? {
                    display: rateResult.display as string,
                    details: rateResult.details,
                  }
                : undefined,
            dynamicSubsidyData:
              subsidyResult.type === "dynamic" && subsidyResult.details
                ? {
                    display: subsidyResult.display,
                    details: subsidyResult.details,
                  }
                : undefined,
          };
        }
      }

      // 🔥 2. Fallback - поиск по банку и программе
      const offer = offers.find(
        (o) =>
          o.bank?.name === bankResult.bank && o.program === bankResult.program,
      );

      if (offer) {
        const rateResult = getDisplayRate(offer, dynamicDataMap);
        const subsidyResult = getDisplaySubsidy(offer, dynamicDataMap);

        return {
          dynamicRateData:
            rateResult.type === "dynamic" && rateResult.details
              ? {
                  display: rateResult.display as string,
                  details: rateResult.details,
                }
              : undefined,
          dynamicSubsidyData:
            subsidyResult.type === "dynamic" && subsidyResult.details
              ? {
                  display: subsidyResult.display,
                  details: subsidyResult.details,
                }
              : undefined,
        };
      }

      return null;
    };
  }, [offers, dynamicDataMap, offerIndex]);

  // 🔥 Синхронизируем фильтры с ref
  useEffect(() => {
    if (filtersRef?.current) {
      filtersRef.current.selectedBankFilter = selectedBankFilter;
      filtersRef.current.selectedProgramTypeFilter = selectedProgramTypeFilter;
      filtersRef.current.showOverstatement = showOverstatement;
    }
  }, [
    selectedBankFilter,
    selectedProgramTypeFilter,
    showOverstatement,
    filtersRef,
  ]);

  // 🔥 Синхронизируем выбранные карточки с ref
  useEffect(() => {
    if (filtersRef?.current) {
      filtersRef.current.selectedCards = selectedCards;
    }
  }, [selectedCards, filtersRef]);

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

  const filteredResultsWithIndex = useMemo(() => {
    return filteredBankResults.map((offer, index) => ({
      ...offer,
      _originalIndex: index,
    }));
  }, [filteredBankResults]);

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

  const getProgramTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      base: "Базовая ипотека",
      full: "Субсидия / Весь срок",
      short: "Субсидия / Короткий срок",
      family: "Семейная ипотека",
      it: "ИТ ипотека",
      tranche: "Траншевая ипотека",
    };
    return labels[type] || type;
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

  const selectAllCards = () => {
    const allIndices = filteredBankResults.map((_, idx) => idx);
    setSelectedCards(new Set(allIndices));
  };

  const deselectAllCards = () => {
    setSelectedCards(new Set());
  };

  if (loading) {
    return (
      <div className="loading-dynamic-data">
        Загрузка динамических данных...
      </div>
    );
  }

  return (
    <div className="results-section">
      <div className="banks-header-wrapper">
        <h3 className="banks-header">
          Предложения банков ({filteredBankResults.length})
        </h3>

        <BankFilters
          selectedBankFilter={selectedBankFilter}
          selectedProgramTypeFilter={selectedProgramTypeFilter}
          uniqueBanks={uniqueBanks}
          uniqueProgramTypes={uniqueProgramTypes}
          isFiltersActive={isFiltersActive}
          showOverstatement={showOverstatement}
          onBankFilterChange={onBankFilterChange}
          onProgramTypeFilterChange={onProgramTypeFilterChange}
          onResetFilters={onResetFilters}
          onToggleOverstatement={onToggleOverstatement}
          getProgramTypeLabel={getProgramTypeLabel}
        />
      </div>

      {sortedBanks.length === 0 ? (
        <NoResults onReset={onResetFilters} />
      ) : (
        sortedBanks.map((bankName) => (
          <BankGroup
            key={bankName}
            bankName={bankName}
            bankData={groupedData[bankName]}
            filteredBankResults={filteredResultsWithIndex}
            selectedCards={selectedCards}
            showOverstatement={showOverstatement}
            isSpecialMortgageMode={isSpecialMortgageMode}
            complexName={complexName}
            loanTermYears={loanTermYears}
            formatMoney={formatMoney}
            onCardClick={handleCardClick}
            hasProgramsInCategory={hasProgramsInCategory}
            getDynamicDataForOffer={getDynamicDataForOffer}
          />
        ))
      )}

      {selectedCards.size > 0 && (
        <FloatingSelectionBar
          selectedCards={selectedCards}
          filteredBankResults={filteredBankResults}
          complexName={complexName}
          area={area}
          formatMoney={formatMoney}
          showOverstatement={showOverstatement}
          isSpecialMortgageMode={isSpecialMortgageMode}
          loanTermYears={loanTermYears}
          onSelectAll={selectAllCards}
          onDeselectAll={deselectAllCards}
        />
      )}
    </div>
  );
};
