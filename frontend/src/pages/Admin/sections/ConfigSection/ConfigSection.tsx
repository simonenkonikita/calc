// frontend/src/pages/Admin/sections/ConfigSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../../services/adminApi";
import { AdminConfig, BankOrderItem } from "../../types/admin.types";
import { AdminLayout } from "../../components/AdminLayout/AdminLayout";
import { useConfig } from "../../../../hooks/api/useConfig";
import "./ConfigSection.css";

// ============================================================
// 🔥 ДЕФОЛТНЫЕ ЗНАЧЕНИЯ ДЛЯ ПЕРВОГО СОЗДАНИЯ КОНФИГА
// ============================================================
const DEFAULT_CONFIG: Omit<AdminConfig, "id" | "createdAt" | "updatedAt"> = {
  familyMortgageLimit: 6000000,
  maxFamilyMortgageLimit: 15000000,
  itMortgageLimit: 9000000,
  maxItMortgageLimit: 18000000,
  minArea: 1,
  maxArea: 250,
  minDownPaymentPercent: 20.1,
  maxDownPaymentPercent: 99.9,
  minLoanTerm: 1,
  maxLoanTerm: 30,
  bankOrder: [{ name: "Сбербанк", displayOrder: 1 }],
};

export const ConfigSection: React.FC = () => {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [isNewConfig, setIsNewConfig] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ✅ Получаем refresh из useConfig
  const { refresh: refreshConfig } = useConfig();

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // 🔥 ЗАГРУЗКА: проверяем существование конфига
  // ============================================================
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 🔥 1. Проверяем, существует ли конфиг
      const checkResult = await adminApi.checkConfig();

      if (!checkResult.exists) {
        // 🔥 2. Конфига нет — показываем форму с дефолтами
        console.log("📝 Config does not exist, showing create form");
        setIsNewConfig(true);
        setConfig({
          id: "",
          ...DEFAULT_CONFIG,
          createdAt: "",
          updatedAt: "",
        });
        return;
      }

      // 🔥 3. Конфиг есть — загружаем
      setIsNewConfig(false);
      const configData = await adminApi.getConfig();
      setConfig(configData);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Не удалось загрузить конфигурацию");
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

  // ============================================================
  // 🔥 СОХРАНЕНИЕ: создаём ИЛИ обновляем
  // ============================================================
  const handleSaveConfig = async () => {
    if (!config) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

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
        bankOrder: config.bankOrder,
      };

      console.log("📝 Saving config:", updateData);

      // 🔥 Создаём или обновляем
      const wasNew = isNewConfig;
      const saved = wasNew
        ? await adminApi.createConfig(updateData)
        : await adminApi.updateConfig(updateData);

      setConfig(saved);
      setIsNewConfig(false);

      // ✅ Обновляем кэш конфига на фронтенде
      await refreshConfig();

      setSuccess(
        wasNew
          ? "✅ Конфигурация успешно создана!"
          : "✅ Конфигурация успешно сохранена!",
      );

      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error("Error saving config:", error);
      setError(error.message || "Ошибка при сохранении конфигурации");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (isNewConfig) {
      // 🔥 Сброс к дефолтам для новой конфигурации
      setConfig({
        id: "",
        ...DEFAULT_CONFIG,
        createdAt: "",
        updatedAt: "",
      });
      setError(null);
      setSuccess(null);
    } else {
      // Обычная перезагрузка
      loadData();
    }
  };

  // ============================================================
  // РЕНДЕР
  // ============================================================

  if (loading) {
    return <div className="admin-loading">Загрузка конфигурации...</div>;
  }

  // 🔥 Ошибка показывается ТОЛЬКО если конфига нет вообще (и это реальная проблема)
  if (error && !config) {
    return (
      <div className="admin-error">
        <p>{error}</p>
        <button onClick={loadData} className="admin-btn admin-btn-primary">
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
        {/* 🔥 Предупреждение для новой конфигурации */}
        {isNewConfig && (
          <div className="config-warning">
            ⚠️ Конфигурация ещё не создана. Заполните поля и нажмите «Создать
            конфигурацию».
          </div>
        )}

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
              className="admin-btn admin-btn-primary"
            >
              {saving
                ? "💾 Сохранение..."
                : isNewConfig
                  ? "💾 Создать конфигурацию"
                  : "💾 Сохранить конфигурацию"}
            </button>
            <button
              onClick={handleReset}
              disabled={saving}
              className="admin-btn admin-btn-secondary"
            >
              🔄 {isNewConfig ? "Сбросить к дефолтам" : "Отменить изменения"}
            </button>
          </div>
        </div>
      </AdminLayout>
    </div>
  );
};
