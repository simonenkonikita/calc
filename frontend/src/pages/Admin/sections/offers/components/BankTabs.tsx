// frontend/src/pages/Admin/sections/offers/components/BankTabs.tsx

import React from "react";
import { AdminBank } from "../../../types/admin.types";
import { BankTabsProps } from "../types";
import "./BankTabs.css";

export const BankTabs: React.FC<BankTabsProps> = ({
  banks,
  offers,
  selectedBankId,
  onSelect,
}) => {
  return (
    <div className="bank-tabs">
      {banks.map((bank) => {
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
          </button>
        );
      })}
    </div>
  );
};