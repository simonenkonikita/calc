// frontend/src/components/admin/Tabs.tsx

import React from "react";
import "./Tabs.css";

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  count?: number;
  isActive?: boolean;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  emptyMessage?: string;
  emptyHint?: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  selectedId,
  onSelect,
  emptyMessage = "Нет активных элементов",
  emptyHint = "Активируйте элементы в соответствующем разделе",
  className = "",
}) => {
  // 🔥 Фильтруем только активные вкладки
  const activeTabs = tabs.filter((tab) => tab.isActive !== false);

  // 🔥 Если выбранная вкладка неактивна - переключаем на первую активную
  React.useEffect(() => {
    if (selectedId) {
      const selectedTab = tabs.find((t) => t.id === selectedId);
      if (
        selectedTab &&
        selectedTab.isActive === false &&
        activeTabs.length > 0
      ) {
        onSelect(activeTabs[0].id);
      }
    }
  }, [selectedId, tabs, activeTabs, onSelect]);

  // Если нет активных вкладок - показываем сообщение
  if (activeTabs.length === 0) {
    return (
      <div className="tabs-empty">
        <span className="tabs-empty-message">{emptyMessage}</span>
        <span className="tabs-empty-hint">{emptyHint}</span>
      </div>
    );
  }

  return (
    <div className={`tabs ${className}`}>
      {activeTabs.map((tab) => (
        <button
          key={tab.id}
          className={`tabs-item ${selectedId === tab.id ? "active" : ""} ${tab.disabled ? "disabled" : ""}`}
          onClick={() => !tab.disabled && onSelect(tab.id)}
          disabled={tab.disabled}
        >
          {tab.icon && <span className="tabs-icon">{tab.icon}</span>}
          <span className="tabs-label">{tab.label}</span>
          {tab.count !== undefined && (
            <span className="tabs-count">{tab.count}</span>
          )}
          {tab.isActive === false && (
            <span className="tabs-status inactive">❌</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
