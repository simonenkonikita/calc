// frontend/src/components/admin/BankSelector.tsx

import React, { useState, useRef, useEffect } from "react";
import { AdminBank } from "../types/admin.types";

interface BankSelectorProps {
  selectedBanks: string[];
  onChange: (banks: string[]) => void;
  banks: AdminBank[];
  placeholder?: string;
  disabled?: boolean;
  label?: string;
}

export const BankSelector: React.FC<BankSelectorProps> = ({
  selectedBanks,
  onChange,
  banks,
  placeholder = "Выберите банки...",
  disabled = false,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрываем dropdown при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleBank = (bankName: string) => {
    if (selectedBanks.includes(bankName)) {
      onChange(selectedBanks.filter((b) => b !== bankName));
    } else {
      onChange([...selectedBanks, bankName]);
    }
  };

  const selectAll = () => {
    onChange(banks.map((b) => b.name));
  };

  const deselectAll = () => {
    onChange([]);
  };

  const getSelectedCount = () => {
    return selectedBanks.length;
  };

  const getDisplayText = () => {
    if (getSelectedCount() === 0) return placeholder;
    return `Выбрано: ${getSelectedCount()} ${getSelectedCount() === 1 ? "банк" : "банков"}`;
  };

  if (disabled) {
    return (
      <div
        style={{
          padding: "0.3rem 0.6rem",
          background: "#f3f4f6",
          borderRadius: "0.375rem",
          color: "#6b7280",
          fontSize: "0.85rem",
          minHeight: "38px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {getDisplayText()}
      </div>
    );
  }

  return (
    <div
      className="bank-selector"
      ref={dropdownRef}
      style={{ position: "relative", minWidth: "200px" }}
    >
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#374151",
            marginBottom: "0.25rem",
          }}
        >
          {label}
        </label>
      )}

      <div
        className="bank-selector-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.3rem 0.6rem",
          border: isOpen ? "2px solid #818cf8" : "1px solid #e5e7eb",
          borderRadius: "0.375rem",
          cursor: disabled ? "not-allowed" : "pointer",
          background: disabled ? "#f3f4f6" : "white",
          minHeight: "38px",
          minWidth: "200px",
          transition: "all 0.2s",
          boxShadow: isOpen ? "0 0 0 3px rgba(99, 102, 241, 0.1)" : "none",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span
          style={{
            fontSize: "0.85rem",
            color: getSelectedCount() === 0 ? "#9ca3af" : "#374151",
          }}
        >
          {getDisplayText()}
        </span>
        <span
          style={{
            fontSize: "0.7rem",
            color: "#6b7280",
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </div>

      {isOpen && !disabled && (
        <div
          className="bank-selector-dropdown"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            maxHeight: "220px",
            overflowY: "auto",
            zIndex: 1000,
            padding: "0.25rem",
            animation: "fadeIn 0.15s ease",
          }}
        >
          {/* Кнопки управления */}
          <div
            style={{
              display: "flex",
              gap: "0.25rem",
              padding: "0.25rem",
              borderBottom: "1px solid #f3f4f6",
              marginBottom: "0.25rem",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={selectAll}
              className="bank-selector-btn"
              style={{
                fontSize: "0.7rem",
                padding: "0.2rem 0.6rem",
                background: "#e5e7eb",
                border: "none",
                borderRadius: "0.25rem",
                cursor: "pointer",
                transition: "background 0.15s",
                color: "#374151",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#d1d5db";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#e5e7eb";
              }}
            >
              ✅ Выбрать все
            </button>
            <button
              onClick={deselectAll}
              className="bank-selector-btn"
              style={{
                fontSize: "0.7rem",
                padding: "0.2rem 0.6rem",
                background: "#e5e7eb",
                border: "none",
                borderRadius: "0.25rem",
                cursor: "pointer",
                transition: "background 0.15s",
                color: "#374151",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#d1d5db";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#e5e7eb";
              }}
            >
              🗑️ Очистить
            </button>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "0.7rem",
                color: "#6b7280",
                display: "flex",
                alignItems: "center",
              }}
            >
              {banks.length} {banks.length === 1 ? "банк" : "банков"}
            </span>
          </div>

          {/* Список банков */}
          {banks.length === 0 ? (
            <div
              style={{
                padding: "0.5rem",
                color: "#6b7280",
                fontSize: "0.8rem",
                textAlign: "center",
              }}
            >
              Нет доступных банков
            </div>
          ) : (
            banks.map((bank) => (
              <label
                key={bank.id}
                className="bank-selector-option"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.3rem 0.5rem",
                  cursor: "pointer",
                  borderRadius: "0.25rem",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedBanks.includes(bank.name)}
                  onChange={() => toggleBank(bank.name)}
                  style={{
                    cursor: "pointer",
                    width: "16px",
                    height: "16px",
                    accentColor: "#818cf8",
                  }}
                />
                <span style={{ fontSize: "0.85rem", flex: 1 }}>
                  {bank.name}
                </span>
                {bank.baseRate !== undefined && (
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: "#6b7280",
                      background: "#f3f4f6",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "9999px",
                    }}
                  >
                    {bank.baseRate}%
                  </span>
                )}
                {bank.isActive === false && (
                  <span
                    style={{
                      fontSize: "0.6rem",
                      color: "#ef4444",
                      background: "#fee2e2",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "9999px",
                    }}
                  >
                    неактивен
                  </span>
                )}
              </label>
            ))
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .bank-selector-trigger {
          user-select: none;
        }

        .bank-selector-trigger:hover {
          border-color: ${disabled ? "#e5e7eb" : "#9ca3af"};
        }

        .bank-selector-dropdown {
          animation: fadeIn 0.15s ease;
        }

        .bank-selector-btn:hover {
          background: #d1d5db !important;
        }

        .bank-selector-option {
          user-select: none;
        }

        .bank-selector-option input[type="checkbox"] {
          accent-color: #818cf8;
        }

        /* Стили для скролла */
        .bank-selector-dropdown::-webkit-scrollbar {
          width: 6px;
        }

        .bank-selector-dropdown::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }

        .bank-selector-dropdown::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .bank-selector-dropdown::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default BankSelector;
