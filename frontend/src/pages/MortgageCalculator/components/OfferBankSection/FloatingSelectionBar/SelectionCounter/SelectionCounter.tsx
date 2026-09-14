// src/components/SelectionCounter/SelectionCounter.tsx
import React from "react";
import "./SelectionCounter.css";

interface SelectionCounterProps {
  count: number;
  className?: string;
  label?: string;
}

export const SelectionCounter: React.FC<SelectionCounterProps> = ({
  count,
  className = "",
  label = "Выбрано",
}) => {
  return (
    <span className={`selection-count ${className}`}>
      {label}: {count}
    </span>
  );
};
