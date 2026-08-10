// frontend/src/pages/Admin/sections/OfferRatesSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../services/adminApi";
import "./OfferRatesSection.css";

interface OfferRatesSectionProps {
  offerId: string;
}

export const OfferRatesSection: React.FC<OfferRatesSectionProps> = ({
  offerId,
}) => {
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRates();
  }, [offerId]);

  const loadRates = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getOfferRates(offerId);
      setRates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading rates:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <div className="offer-rates-section">
      <div className="admin-section">
        <div className="admin-section-header">
          <h4>Динамические ставки</h4>
          <button className="admin-btn-primary">+ Добавить</button>
        </div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Условие</th>
                <th>Значение</th>
                <th>Ставка</th>
                <th>Приоритет</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {rates.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: "center", color: "#6b7280" }}
                  >
                    Нет динамических ставок
                  </td>
                </tr>
              ) : (
                rates.map((rate) => (
                  <tr key={rate.id}>
                    <td>{rate.conditionType}</td>
                    <td>{rate.value}</td>
                    <td>{rate.rate}%</td>
                    <td>{rate.priority}</td>
                    <td>
                      <button className="admin-btn-primary">✏️</button>
                      <button className="admin-btn-danger">🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
