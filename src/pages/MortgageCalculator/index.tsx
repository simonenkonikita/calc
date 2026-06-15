import React from "react";
import { useMortgageCalculator } from "../../hooks/useMortgageCalculations";
import { FormSection } from "./FormSection/FormSection";
import "./index.css";
import { ResultsCalcSection } from "./ResultsCalcSection/ResultsCalcSection";
import { OfferBankSection } from "./OfferBankSection/OfferBankSection";

export const MortgageCalculator: React.FC = () => {
  const {
    formData,
    results,
    selectedOfferIndex,
    handleInputChange,
    handleSelectOffer,
    formatMoney,
  } = useMortgageCalculator();

  return (
    <div className="mortgage-calculator-page">
      <h1>Ипотечный калькулятор</h1>

      {/* Весь блок калькулятора*/}
      <div className="calculator">
        {/* Блок с формой*/}
        <div className="calculator-form">
          <FormSection formData={formData} onInputChange={handleInputChange} />
          {/* Блок с цифрами для */}
          {results && (
            <div className="results-white-card">
              <ResultsCalcSection
                objectResult={results.objectResult}
                formatMoney={formatMoney}
              />
            </div>
          )}
        </div>
        {/* Блок с Предложениями банков*/}
        {results && (
          <>
            <div className="section-divider" />
            <OfferBankSection
              bankResults={results.bankResults}
              selectedOfferIndex={selectedOfferIndex}
              onSelectOffer={handleSelectOffer}
              formatMoney={formatMoney}
              mortgageWithoutDownPayment={formData.mortgageWithoutDownPayment}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MortgageCalculator;
