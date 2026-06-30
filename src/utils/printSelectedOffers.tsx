// src/utils/printSelectedOffers.ts

import { BankProgramResult } from "./types";
import { formatOfferToText } from "./formatOfferToText";

interface PrintSelectedOffersParams {
  selectedCards: Set<number>;
  filteredBankResults: BankProgramResult[];
  complexName: string;
  area: number;
  formatMoney: (value: number) => string;
  showOverstatement: boolean;
  isSpecialMortgageMode: boolean;
  loanTermYears: number;
}

export const printSelectedOffers = (params: PrintSelectedOffersParams) => {
  const {
    selectedCards,
    filteredBankResults,
    complexName,
    area,
    formatMoney,
    showOverstatement,
    isSpecialMortgageMode,
    loanTermYears,
  } = params;

  if (selectedCards.size === 0) return;

  const selectedResults = filteredBankResults.filter((_, idx) =>
    selectedCards.has(idx),
  );

  // Группируем по банкам
  const groupedByBank = selectedResults.reduce(
    (acc, offer) => {
      const bankName = offer.bank;
      if (!acc[bankName]) {
        acc[bankName] = [];
      }
      acc[bankName].push(offer);
      return acc;
    },
    {} as Record<string, BankProgramResult[]>,
  );

  // Создаем окно для печати
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Печать предложений</title>
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Courier New', monospace;
              padding: 20px;
              line-height: 1.5;
              color: #333;
              background: #fff;
              font-size: 12px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 18px;
            }
            .header p {
              margin: 4px 0;
              font-size: 12px;
            }
            
            /* Контейнер для банков */
            .banks-container {
              display: flex;
              flex-direction: column;
              gap: 20px;
            }
            
            /* Карточка банка - 2 колонки */
            .bank-card {
              border: 1px solid #e0e0e0;
              border-radius: 6px;
              padding: 12px 14px;
              background: #fafafa;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .bank-card h3 {
              font-size: 13px;
              font-weight: bold;
              color: #1a73e8;
              margin-bottom: 10px;
              padding-bottom: 6px;
              border-bottom: 1px solid #e0e0e0;
            }
            
            /* Сетка 2 колонки для предложений внутри банка */
            .bank-offers-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 20px;
            }
            
            /* Предложение внутри банка */
            .offer-item {
              padding: 6px 0;
              border-bottom: 1px dashed #eee;
              font-size: 10px;
              line-height: 1.5;
              white-space: pre-wrap;
            }
            .offer-item:nth-last-child(1),
            .offer-item:nth-last-child(2) {
              border-bottom: none;
            }
            
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 12px;
              border-top: 1px solid #ddd;
              color: #999;
              font-size: 10px;
              clear: both;
            }
            
            @media print {
              body { padding: 15px; }
              .bank-card { 
                page-break-inside: avoid; 
                break-inside: avoid;
                background: #fff;
              }
            }
            
            @media (max-width: 768px) {
              .bank-offers-grid {
                grid-template-columns: 1fr;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏢 ${complexName}</h1>
            <p>Площадь: ${area} м² | Дата: ${new Date().toLocaleDateString("ru-RU")}</p>
            <p>Выбрано предложений: ${selectedResults.length}</p>
          </div>
          
          <div class="banks-container">
            ${Object.entries(groupedByBank)
              .map(([bankName, offers]) => {
                // Разбиваем предложения на 2 колонки
                const mid = Math.ceil(offers.length / 2);
                const leftOffers = offers.slice(0, mid);
                const rightOffers = offers.slice(mid);

                const renderOffer = (offer: BankProgramResult) => {
                  const offerText = formatOfferToText(
                    offer,
                    formatMoney,
                    showOverstatement,
                    isSpecialMortgageMode,
                    loanTermYears,
                  );
                  const lines = offerText.split("\n");
                  const withoutBank = lines.slice(1).join("\n");
                  return `<div class="offer-item">${withoutBank}</div>`;
                };

                return `
                  <div class="bank-card">
                    <h3>🏦 ${bankName} (${offers.length})</h3>
                    <div class="bank-offers-grid">
                      <div class="bank-offers-left">
                        ${leftOffers.map(renderOffer).join("")}
                      </div>
                      <div class="bank-offers-right">
                        ${rightOffers.map(renderOffer).join("")}
                      </div>
                    </div>
                  </div>
                `;
              })
              .join("")}
          </div>
          
          <div class="footer">
            Сгенерировано в калькуляторе ипотеки
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } else {
    alert("Пожалуйста, разрешите всплывающие окна для печати");
  }
};
