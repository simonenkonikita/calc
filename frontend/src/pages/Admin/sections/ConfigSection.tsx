// frontend/src/pages/Admin/sections/ConfigSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../services/adminApi";
import { AdminConfig } from "../types/admin.types";
import { AdminLayout } from "../AdminLayout";
import "./ConfigSection.css";

export const ConfigSection: React.FC = () => {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<AdminConfig>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const configData = await adminApi.getConfig();

      setConfig(configData);
      setFormData(configData);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      setError(null);

      const configToSave = {
        depositAmount: Number(formData.depositAmount) || 0,
        minDownPayment: Number(formData.minDownPayment) || 20.1,
        maxLoanTerm: Number(formData.maxLoanTerm) || 30,
        defaultComplex: formData.defaultComplex || "",
        bankOrder: formData.bankOrder || [],
      };

      const updated = await adminApi.updateConfig(configToSave);
      setConfig(updated);
      alert("✅ Конфигурация сохранена!");
    } catch (error: any) {
      console.error("Error saving config:", error);
      setError(error.message || "Ошибка при сохранении конфигурации");
      alert(`❌ Ошибка: ${error.message || "Неизвестная ошибка"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">Загрузка...</div>;
  if (error) return <div className="admin-error">{error}</div>;
  if (!config) return <div>Конфигурация не найдена</div>;

  return (
    <div className="config-section">
      <AdminLayout title="⚙️ Конфигурация приложения">
        <div className="config-form">
          <div className="form-group">
            <label>Сумма брони (₽)</label>
            <input
              type="number"
              value={formData.depositAmount ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  depositAmount: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="form-group">
            <label>Минимальный ПВ (%)</label>
            <input
              type="number"
              step="0.1"
              value={formData.minDownPayment ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minDownPayment: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="form-group">
            <label>Максимальный срок ипотеки (лет)</label>
            <input
              type="number"
              value={formData.maxLoanTerm ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxLoanTerm: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="form-group">
            <label>ЖК по умолчанию</label>
            <input
              value={formData.defaultComplex || ""}
              onChange={(e) =>
                setFormData({ ...formData, defaultComplex: e.target.value })
              }
            />
          </div>

          <div className="form-group full-width">
            <label>Порядок банков (через запятую)</label>
            <input
              value={formData.bankOrder?.join(", ") || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bankOrder: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>

          <div className="config-actions">
            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="admin-btn-primary"
            >
              {saving ? "💾 Сохранение..." : "💾 Сохранить конфигурацию"}
            </button>
            <button onClick={loadData} className="admin-btn-secondary">
              🔄 Отменить изменения
            </button>
          </div>
        </div>
      </AdminLayout>
    </div>
  );
};
