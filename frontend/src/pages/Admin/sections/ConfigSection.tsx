// frontend/src/pages/Admin/sections/ConfigSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../services/adminApi";
import { AdminConfig, BankOrderItem } from "../types/admin.types";
import { AdminLayout } from "../AdminLayout";
import { useConfig } from "../../../hooks/api/useConfig"; // ✅ Добавляем
import "./ConfigSection.css";

export const ConfigSection: React.FC = () => {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ✅ Получаем refresh из useConfig
  const { refresh: refreshConfig } = useConfig();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const configData = await adminApi.getConfig();
      setConfig(configData);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = <K extends keyof AdminConfig>(
    field: K,
    value: AdminConfig[K],
  ) => {
    if (config) {
      setConfig({ ...config, [field]: value });
    }
  };

  const handleBankOrderChange = (value: string) => {
    if (!config) return;

    const items: BankOrderItem[] = value
      .split(",")
      .map((s, index) => ({
        name: s.trim(),
        displayOrder: index + 1,
      }))
      .filter((item) => item.name);

    setConfig({ ...config, bankOrder: items });
  };

  const handleSaveConfig = async () => {
    if (!config) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // ✅ Приводим все числовые поля к числовому типу
      const updateData = {
        familyMortgageLimit: Number(config.familyMortgageLimit),
        maxFamilyMortgageLimit: Number(config.maxFamilyMortgageLimit),
        itMortgageLimit: Number(config.itMortgageLimit),
        maxItMortgageLimit: Number(config.maxItMortgageLimit),
        minArea: Number(config.minArea),
        maxArea: Number(config.maxArea),
        minDownPaymentPercent: Number(config.minDownPaymentPercent),
        maxDownPaymentPercent: Number(config.maxDownPaymentPercent),
        minLoanTerm: Number(config.minLoanTerm),
        maxLoanTerm: Number(config.maxLoanTerm),
        deposit: Number(config.deposit),
        bankOrder: config.bankOrder,
      };

      console.log("📝 Saving config:", updateData);

      const updated = await adminApi.updateConfig(updateData);
      setConfig(updated);

      // ✅ Обновляем кэш конфига на фронтенде
      await refreshConfig();

      setSuccess("✅ Конфигурация успешно сохранена!");

      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error("Error saving config:", error);
      setError(error.message || "Ошибка при сохранении конфигурации");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadData();
  };

  if (loading) {
    return <div className="admin-loading">Загрузка конфигурации...</div>;
  }

  if (error) {
    return (
      <div className="admin-error">
        <p>{error}</p>
        <button onClick={loadData} className="admin-btn-primary">
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!config) {
    return <div className="admin-empty">Конфигурация не найдена</div>;
  }

  return (
    <div className="config-section">
      <AdminLayout title="⚙️ Конфигурация приложения">
        <div className="config-form">
          <h3>Государственные лимиты</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Семейная ипотека (базовый лимит)</label>
              <input
                type="number"
                value={config.familyMortgageLimit}
                onChange={(e) =>
                  handleFieldChange(
                    "familyMortgageLimit",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
              />
              <small>Базовый лимит для семейной ипотеки</small>
            </div>
            <div className="form-group">
              <label>Семейная ипотека (максимальный лимит)</label>
              <input
                type="number"
                value={config.maxFamilyMortgageLimit}
                onChange={(e) =>
                  handleFieldChange(
                    "maxFamilyMortgageLimit",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
              />
              <small>Максимальный лимит для семейной ипотеки</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>ИТ ипотека (базовый лимит)</label>
              <input
                type="number"
                value={config.itMortgageLimit}
                onChange={(e) =>
                  handleFieldChange(
                    "itMortgageLimit",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
              />
              <small>Базовый лимит для IT-ипотеки</small>
            </div>
            <div className="form-group">
              <label>ИТ ипотека (максимальный лимит)</label>
              <input
                type="number"
                value={config.maxItMortgageLimit}
                onChange={(e) =>
                  handleFieldChange(
                    "maxItMortgageLimit",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
              />
              <small>Максимальный лимит для IT-ипотеки</small>
            </div>
          </div>

          <h3>Границы для калькулятора</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Минимальная площадь (м²)</label>
              <input
                type="number"
                value={config.minArea}
                onChange={(e) =>
                  handleFieldChange(
                    "minArea",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>Максимальная площадь (м²)</label>
              <input
                type="number"
                value={config.maxArea}
                onChange={(e) =>
                  handleFieldChange(
                    "maxArea",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Минимальный ПВ (%)</label>
              <input
                type="number"
                step="0.1"
                value={config.minDownPaymentPercent}
                onChange={(e) =>
                  handleFieldChange(
                    "minDownPaymentPercent",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>Максимальный ПВ (%)</label>
              <input
                type="number"
                step="0.1"
                value={config.maxDownPaymentPercent}
                onChange={(e) =>
                  handleFieldChange(
                    "maxDownPaymentPercent",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Минимальный срок (лет)</label>
              <input
                type="number"
                value={config.minLoanTerm}
                onChange={(e) =>
                  handleFieldChange(
                    "minLoanTerm",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>Максимальный срок (лет)</label>
              <input
                type="number"
                value={config.maxLoanTerm}
                onChange={(e) =>
                  handleFieldChange(
                    "maxLoanTerm",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
              />
            </div>
          </div>

          <h3>Дополнительные настройки</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Сумма брони (₽)</label>
              <input
                type="number"
                value={config.deposit}
                onChange={(e) =>
                  handleFieldChange(
                    "deposit",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
              />
              <small>Сумма, которая вычитается из стоимости объекта</small>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Порядок банков (через запятую)</label>
            <input
              value={config.bankOrder.map((item) => item.name).join(", ")}
              onChange={(e) => handleBankOrderChange(e.target.value)}
              placeholder="Сбербанк, ВТБ, Альфа-Банк, Совкомбанк, Уралсиб, Дом.РФ Банк"
            />
            <small>
              Порядок отображения банков на фронтенде. Текущий порядок:{" "}
              {config.bankOrder
                .map((item) => `${item.name} (${item.displayOrder})`)
                .join(", ")}
            </small>
          </div>

          {error && <div className="form-error">❌ {error}</div>}

          {success && <div className="form-success">{success}</div>}

          <div className="config-actions">
            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="admin-btn-primary"
            >
              {saving ? "💾 Сохранение..." : "💾 Сохранить конфигурацию"}
            </button>
            <button
              onClick={handleReset}
              disabled={saving}
              className="admin-btn-secondary"
            >
              🔄 Отменить изменения
            </button>
          </div>
        </div>
      </AdminLayout>
    </div>
  );
};
