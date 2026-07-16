// src/components/BankCard/BankCardHeader.tsx
import React from "react";
import { BankProgramResultWithIndex } from "../../../../utils/types";
import { safeFormatMoney } from "../../../../utils/formatMoney";

interface BankCardHeaderProps {
  offer: BankProgramResultWithIndex;
  isShortWithSubsidy: boolean;
  isTwoContracts: boolean;
  formatMoney: (amount: number) => string;
}

export const BankCardHeader: React.FC<BankCardHeaderProps> = ({
  offer,
  isShortWithSubsidy,
  isTwoContracts,
  formatMoney,
}) => {
  const getProgramName = () => {
    switch (offer.type) {
      case "full":
        return "Весь срок";
      case "short":
        return `Короткий срок (${offer.durationMonths} мес)`;
      case "family":
        return "Семейная ипотека";
      case "it":
        return "ИТ ипотека";
      case "tranche":
        return "Траншевая ипотека";
      default:
        return "";
    }
  };

  const renderRates = () => {
    if (isShortWithSubsidy) {
      return (
        <div className="bank-rates">
          <span className="bank-rate">
            {offer.shortRate || offer.rate}% → {offer.rate}%
          </span>
        </div>
      );
    }

    if (isTwoContracts) {
      return (
        <div className="bank-rates-two-contracts">
          <span className="bank-rate">{offer.rate}%</span>
          <span className="bank-rate">{offer.twoRate}%</span>
        </div>
      );
    }

    if (offer.rate && offer.rate > 0) {
      return <p className="bank-rate">{offer.rate}%</p>;
    }

    return null;
  };

  const renderPayment = () => {
    if (isShortWithSubsidy) {
      return (
        <div className="payment-values-wrapper">
          <p className="payment-value payment-with-subsidy">
            {formatMoney(offer.monthlyPayment)}
          </p>
          <p className="payment-value payment-after-subsidy">
            → {safeFormatMoney(offer.monthlyPaymentAfter)}
          </p>
        </div>
      );
    }

    if (offer.isTranche) {
      return (
        <div className="payment-values-wrapper">
          <p className="payment-value payment-with-subsidy">
            {formatMoney(offer.firstTranchePayment || 0)}
          </p>
          <p className="payment-value payment-after-subsidy">
            → {formatMoney(offer.secondTranchePayment || 0)}
          </p>
        </div>
      );
    }

    if (isTwoContracts) {
      return (
        <div className="payment-values-wrapper">
          <p className="payment-value payment-with-subsidy">
            {formatMoney(offer.firstContractPayment)}
          </p>
          <p className="payment-value payment-with-subsidy">
            {formatMoney(offer.secondContractPayment)}
          </p>
        </div>
      );
    }

    return <p className="payment-value">{formatMoney(offer.monthlyPayment)}</p>;
  };

  return (
    <div className="bank-card-header">
      <div className="bank-info">
        <p className="bank-program">{getProgramName()}</p>
        {renderRates()}
      </div>

      <div className="payment-info">
        <p className="payment-label">Ежемесячный платёж</p>
        {renderPayment()}
      </div>
    </div>
  );
};
