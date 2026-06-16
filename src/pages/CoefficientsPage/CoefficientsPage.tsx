import React, { useState, useMemo } from "react";
import "./CoefficientsPage.css";
import { bankOffers } from "../../data/bankOffers";
import { calculateBankCoefficients } from "../../hooks/mortgageCalculations";

export const CoefficientsPage: React.FC = () => {
  const [selectedBank, setSelectedBank] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedBank, setExpandedBank] = useState<string | null>(null);

  // Получаем уникальные банки
  const uniqueBanks = useMemo(() => {
    return Array.from(new Set(bankOffers.map((offer) => offer.bank)));
  }, []);

  // Фильтрация и расчёт коэффициентов
  const filteredData = useMemo(() => {
    let filtered = bankOffers;

    if (selectedBank !== "all") {
      filtered = filtered.filter((offer) => offer.bank === selectedBank);
    }

    if (searchTerm) {
      filtered = filtered.filter((offer) =>
        offer.program.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered.map((offer) => ({
      ...offer,
      coefficients: calculateBankCoefficients(offer),
    }));
  }, [selectedBank, searchTerm]);

  // Группировка по банкам
  const groupedByBank = useMemo(() => {
    return filteredData.reduce(
      (acc, item) => {
        if (!acc[item.bank]) acc[item.bank] = [];
        acc[item.bank].push(item);
        return acc;
      },
      {} as Record<string, typeof filteredData>,
    );
  }, [filteredData]);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      full: "Весь срок",
      short: "Короткий срок",
      family: "Семейная",
      it: "ИТ ипотека",
    };
    return labels[type] || type;
  };

  const toggleBank = (bankName: string) => {
    setExpandedBank(expandedBank === bankName ? null : bankName);
  };

  return (
    <div className="coefficients-page">
      <div className="coefficients-page-header">
        <h1>📊 Коэффициенты банковских программ</h1>
        <p>
          Расчёт коэффициентов по формулам Excel (Сбербанк, ВТБ, Совкомбанк,
          Альфа-Банк, Уралсиб)
        </p>
      </div>

      {/* Белая карточка для фильтров */}
      <div className="coefficients-card">
        {/* Фильтры */}
        <div className="filters-bar">
          <div className="filter-group">
            <label>Банк:</label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
            >
              <option value="all">Все банки ({uniqueBanks.length})</option>
              {uniqueBanks.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Поиск:</label>
            <input
              type="text"
              placeholder="Название программы..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="reset-btn"
            onClick={() => {
              setSelectedBank("all");
              setSearchTerm("");
            }}
          >
            Сбросить фильтры
          </button>
        </div>

        {/* Информация о количестве */}
        <div className="info-bar">
          <span>📋 Найдено программ: {filteredData.length}</span>
          <span>🏦 Банков: {Object.keys(groupedByBank).length}</span>
        </div>

        {/* Таблицы по банкам */}
        {Object.entries(groupedByBank).map(([bankName, programs]) => (
          <div key={bankName} className="bank-section">
            <div className="bank-title" onClick={() => toggleBank(bankName)}>
              <div className="bank-title-left">
                <h2>🏦 {bankName}</h2>
                <span className="programs-count">
                  {programs.length} программ
                </span>
              </div>
              <span className="expand-icon">
                {expandedBank === bankName ? "▼" : "▶"}
              </span>
            </div>

            {expandedBank === bankName && (
              <div className="table-wrapper">
                <table className="coefficients-table">
                  <thead>
                    <tr>
                      <th rowSpan={2}>Программа</th>
                      <th rowSpan={2}>Тип</th>
                      <th rowSpan={2}>Ставка</th>
                      <th rowSpan={2}>Субсидия</th>
                      <th rowSpan={2}>Мин. ПВ</th>
                      <th colSpan={3}>Исходные данные</th>
                      <th colSpan={2}>Коэффициенты</th>
                      <th colSpan={3}>Искомые коэффициенты</th>
                    </tr>
                    <tr>
                      <th>Сумма ПВ %</th>
                      <th>Сумма ипотеки %</th>
                      <th>Каэф ПВ</th>
                      <th>Каэф ипотеки</th>
                      <th>Каэф завышения</th>
                      <th>С мин ПВ</th>
                      <th>С большим ПВ</th>
                      <th>Без ПВ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map((program, idx) => {
                      const c = program.coefficients;
                      return (
                        <tr key={`${program.bank}-${program.program}-${idx}`}>
                          <td className="program-cell">
                            {program.program}
                            {program.durationMonths && (
                              <span className="duration-badge">
                                {program.durationMonths} мес
                              </span>
                            )}
                            {program.isTwoContracts && (
                              <span className="feature-badge">2 договора</span>
                            )}
                            {program.excessLimit && (
                              <span className="feature-badge">Сверхлимит</span>
                            )}
                          </td>
                          <td>
                            <span className={`type-badge type-${program.type}`}>
                              {getTypeLabel(program.type)}
                            </span>
                          </td>
                          <td className="rate-cell">{program.rate}%</td>
                          <td>{program.subsidyPercent}%</td>
                          <td>{program.minPVPercent}%</td>
                          <td className="coeff-cell">
                            {c.downPaymentPercent.toFixed(2)}%
                          </td>
                          <td className="coeff-cell">
                            {c.mortgagePercent.toFixed(2)}%
                          </td>
                          <td className="coeff-cell">
                            {c.kefDownPayment.toFixed(4)}
                          </td>
                          <td className="coeff-cell highlight">
                            {c.mortgageCoefficient.toFixed(6)}
                          </td>
                          <td className="coeff-cell highlight">
                            {c.overstatementCoefficient.toFixed(4)}%
                          </td>
                          <td className="coeff-cell important">
                            {c.requiredCoeffWithMinPV.toFixed(6)}
                          </td>
                          <td className="coeff-cell important">
                            {c.requiredCoeffWithLargePV.toFixed(6)}
                          </td>
                          <td className="coeff-cell important">
                            {c.requiredCoeffWithoutPV.toFixed(6)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
