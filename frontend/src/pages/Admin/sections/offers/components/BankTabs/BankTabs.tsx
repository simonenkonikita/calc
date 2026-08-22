// frontend/src/pages/Admin/sections/offers/components/BankTabs.tsx

import React from "react";
import "./BankTabs.css";
import { BankTabsProps } from "../../types";

export const BankTabs: React.FC<BankTabsProps> = ({
  banks,
  offers,
  selectedBankId,
  onSelect,
}) => {
  // 🔥 Фильтруем только активные банки
  const activeBanks = banks.filter((bank) => bank.isActive === true);

  // 🔥 Если выбранный банк неактивен - переключаем на первый активный
  React.useEffect(() => {
    if (selectedBankId) {
      const selectedBank = banks.find((b) => b.id === selectedBankId);
      if (selectedBank && !selectedBank.isActive && activeBanks.length > 0) {
        onSelect(activeBanks[0].id);
      }
    }
  }, [selectedBankId, banks, activeBanks, onSelect]);

  // Если нет активных банков - показываем сообщение
  if (activeBanks.length === 0) {
    return (
      <div className="bank-tabs-empty">
        <span className="empty-message">😕 Нет активных банков</span>
        <span className="empty-hint">
          Активируйте банк в разделе "Банки-партнеры"
        </span>
      </div>
    );
  }

  return (
    <div className="bank-tabs">
      {activeBanks.map((bank) => {
        const count = offers.filter((o) => o.bankId === bank.id).length;
        return (
          <button
            key={bank.id}
            className={`bank-tab ${selectedBankId === bank.id ? "active" : ""}`}
            onClick={() => onSelect(bank.id)}
          >
            <span className="bank-tab-icon">🏦</span>
            <span className="bank-tab-name">{bank.name}</span>
            <span className="bank-tab-count">{count}</span>
            {!bank.isActive && (
              <span className="bank-tab-status inactive">❌</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
