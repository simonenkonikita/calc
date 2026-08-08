// frontend/src/pages/Admin/sections/ConfigSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../services/adminApi";
import { AdminConfig } from "../types/admin.types";
import { AdminLayout } from "../AdminLayout";

export const ConfigSection: React.FC = () => {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<AdminConfig>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getConfig();
      setConfig(data);
      setFormData(data);
    } catch (error) {
      console.error("Error loading config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await adminApi.updateConfig(formData);
      setConfig(updated);
      alert("Конфигурация сохранена!");
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Ошибка при сохранении конфигурации");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">Загрузка...</div>;
  if (!config) return <div>Конфигурация не найдена</div>;

  return (
    <AdminLayout title="⚙️ Конфигурация приложения">
      <div className="admin-config-form">
        <div className="form-group">
          <label>Сумма брони (₽)</label>
          <input
            type="number"
            value={formData.depositAmount ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                depositAmount: parseInt(e.target.value),
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
                minDownPayment: parseFloat(e.target.value),
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
                maxLoanTerm: parseInt(e.target.value),
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

        <div className="form-group">
          <label>Порядок банков (через запятую)</label>
          <input
            value={formData.bankOrder?.join(", ") || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                bankOrder: e.target.value.split(",").map((s) => s.trim()),
              })
            }
          />
        </div>

        <div className="admin-config-actions">
          <button
            onClick={handleSave}
            disabled={saving}
            className="admin-btn-primary"
          >
            {saving ? "💾 Сохранение..." : "💾 Сохранить конфигурацию"}
          </button>
          <button onClick={loadConfig} className="admin-btn-secondary">
            🔄 Отменить изменения
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};
