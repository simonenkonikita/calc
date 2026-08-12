// frontend/src/pages/Admin/sections/DynamicSubsidiesTable.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../services/adminApi";

interface DynamicSubsidy {
  id: string;
  offerId: string;
  minPVPercent: number | null;
  maxPVPercent: number | null;
  minAmount: number | null;
  maxAmount: number | null;
  minTerm: number | null;
  maxTerm: number | null;
  subsidyPercent: number;
  priority: number;
  description: string;
  roundingStrategy: string | null;
  isActive: boolean;
}

interface DynamicSubsidiesTableProps {
  offerId: string;
  onUpdate?: () => void;
}

export const DynamicSubsidiesTable: React.FC<DynamicSubsidiesTableProps> = ({
  offerId,
  onUpdate,
}) => {
  const [subsidies, setSubsidies] = useState<DynamicSubsidy[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<DynamicSubsidy>>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadSubsidies();
  }, [offerId]);

  const loadSubsidies = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getOfferDynamicSubsidies(offerId);
      setSubsidies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading subsidies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const newSubsidy = await adminApi.createDynamicSubsidy(offerId, {
        minPVPercent: formData.minPVPercent || null,
        maxPVPercent: formData.maxPVPercent || null,
        minAmount: formData.minAmount || null,
        maxAmount: formData.maxAmount || null,
        minTerm: formData.minTerm || null,
        maxTerm: formData.maxTerm || null,
        subsidyPercent: formData.subsidyPercent || 0,
        priority: formData.priority || 0,
        description: formData.description || "",
        roundingStrategy: formData.roundingStrategy || null,
        isActive: true,
      });
      setSubsidies([...subsidies, newSubsidy]);
      setIsCreating(false);
      setFormData({});
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error creating subsidy:", error);
      alert("Ошибка при создании субсидии");
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const updated = await adminApi.updateDynamicSubsidy(id, formData);
      setSubsidies(subsidies.map((s) => (s.id === id ? updated : s)));
      setEditingId(null);
      setFormData({});
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error updating subsidy:", error);
      alert("Ошибка при обновлении субсидии");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить субсидию?")) return;
    try {
      await adminApi.deleteDynamicSubsidy(id);
      setSubsidies(subsidies.filter((s) => s.id !== id));
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error deleting subsidy:", error);
      alert("Ошибка при удалении субсидии");
    }
  };

  const startEdit = (subsidy: DynamicSubsidy) => {
    setEditingId(subsidy.id);
    setFormData({
      minPVPercent: subsidy.minPVPercent,
      maxPVPercent: subsidy.maxPVPercent,
      minAmount: subsidy.minAmount,
      maxAmount: subsidy.maxAmount,
      minTerm: subsidy.minTerm,
      maxTerm: subsidy.maxTerm,
      subsidyPercent: subsidy.subsidyPercent,
      priority: subsidy.priority,
      description: subsidy.description,
      roundingStrategy: subsidy.roundingStrategy,
      isActive: subsidy.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
    setIsCreating(false);
  };

  const formatNumber = (value: number | null) => {
    if (value === null || value === undefined) return "—";
    return new Intl.NumberFormat("ru-RU").format(value);
  };

  if (loading)
    return (
      <div style={{ padding: "0.5rem", color: "#6b7280" }}>
        Загрузка субсидий...
      </div>
    );

  return (
    <div className="admin-section" style={{ margin: 0, padding: "0.5rem" }}>
      <div className="admin-section-header" style={{ marginBottom: "0.5rem" }}>
        <h4 style={{ fontSize: "0.9rem", margin: 0 }}>
          💰 Динамические субсидии ({subsidies.length})
        </h4>
        <button
          onClick={() => setIsCreating(true)}
          className="admin-btn-primary admin-btn-sm"
          disabled={isCreating}
        >
          + Добавить
        </button>
      </div>

      <div
        className="admin-table-wrapper"
        style={{ maxHeight: "300px", overflowY: "auto" }}
      >
        <table className="admin-table" style={{ fontSize: "0.75rem" }}>
          <thead>
            <tr>
              <th>ПВ от</th>
              <th>ПВ до</th>
              <th>Сумма от</th>
              <th>Сумма до</th>
              <th>Срок от</th>
              <th>Срок до</th>
              <th>Субсидия</th>
              <th>Приор</th>
              <th>Описание</th>
              <th>Активен</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {isCreating && (
              <tr>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="от"
                    value={formData.minPVPercent ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minPVPercent: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      })
                    }
                    style={{ width: "50px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="до"
                    value={formData.maxPVPercent ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxPVPercent: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      })
                    }
                    style={{ width: "50px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="от"
                    value={formData.minAmount ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minAmount: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      })
                    }
                    style={{ width: "70px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="до"
                    value={formData.maxAmount ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxAmount: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      })
                    }
                    style={{ width: "70px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="от"
                    value={formData.minTerm ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minTerm: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    style={{ width: "40px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="до"
                    value={formData.maxTerm ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxTerm: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    style={{ width: "40px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="%"
                    value={formData.subsidyPercent ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subsidyPercent: parseFloat(e.target.value) || 0,
                      })
                    }
                    style={{ width: "50px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="Приор"
                    value={formData.priority ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: parseInt(e.target.value) || 0,
                      })
                    }
                    style={{ width: "40px" }}
                  />
                </td>
                <td>
                  <input
                    placeholder="Описание"
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    style={{ width: "80px" }}
                  />
                </td>
                <td>✅</td>
                <td>
                  <div className="admin-actions">
                    <button
                      onClick={handleCreate}
                      className="admin-btn-success admin-btn-xs"
                    >
                      💾
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="admin-btn-danger admin-btn-xs"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {subsidies.map((subsidy) => (
              <tr key={subsidy.id}>
                {editingId === subsidy.id ? (
                  <>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.minPVPercent ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minPVPercent: e.target.value
                              ? parseFloat(e.target.value)
                              : null,
                          })
                        }
                        style={{ width: "50px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.maxPVPercent ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxPVPercent: e.target.value
                              ? parseFloat(e.target.value)
                              : null,
                          })
                        }
                        style={{ width: "50px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={formData.minAmount ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minAmount: e.target.value
                              ? parseFloat(e.target.value)
                              : null,
                          })
                        }
                        style={{ width: "70px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={formData.maxAmount ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxAmount: e.target.value
                              ? parseFloat(e.target.value)
                              : null,
                          })
                        }
                        style={{ width: "70px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={formData.minTerm ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minTerm: e.target.value
                              ? parseInt(e.target.value)
                              : null,
                          })
                        }
                        style={{ width: "40px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={formData.maxTerm ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxTerm: e.target.value
                              ? parseInt(e.target.value)
                              : null,
                          })
                        }
                        style={{ width: "40px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.subsidyPercent ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            subsidyPercent: parseFloat(e.target.value) || 0,
                          })
                        }
                        style={{ width: "50px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={formData.priority ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            priority: parseInt(e.target.value) || 0,
                          })
                        }
                        style={{ width: "40px" }}
                      />
                    </td>
                    <td>
                      <input
                        value={formData.description || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        style={{ width: "80px" }}
                      />
                    </td>
                    <td>
                      <select
                        value={formData.isActive ? "active" : "inactive"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.value === "active",
                          })
                        }
                      >
                        <option value="active">✅</option>
                        <option value="inactive">❌</option>
                      </select>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          onClick={() => handleUpdate(subsidy.id)}
                          className="admin-btn-success admin-btn-xs"
                        >
                          💾
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="admin-btn-danger admin-btn-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{subsidy.minPVPercent ?? "—"}</td>
                    <td>{subsidy.maxPVPercent ?? "∞"}</td>
                    <td>{formatNumber(subsidy.minAmount)}</td>
                    <td>{formatNumber(subsidy.maxAmount)}</td>
                    <td>{subsidy.minTerm ?? "—"}</td>
                    <td>{subsidy.maxTerm ?? "∞"}</td>
                    <td>{subsidy.subsidyPercent}%</td>
                    <td>{subsidy.priority}</td>
                    <td title={subsidy.description}>
                      {subsidy.description?.substring(0, 20) || "-"}
                    </td>
                    <td>{subsidy.isActive ? "✅" : "❌"}</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          onClick={() => startEdit(subsidy)}
                          className="admin-btn-primary admin-btn-xs"
                          title="Редактировать"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(subsidy.id)}
                          className="admin-btn-danger admin-btn-xs"
                          title="Удалить"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
