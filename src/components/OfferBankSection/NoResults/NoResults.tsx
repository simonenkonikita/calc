// src/components/NoResults/NoResults.tsx
import React from "react";
import "./NoResults.css";

interface NoResultsProps {
  onReset: () => void;
  message?: string;
}

export const NoResults: React.FC<NoResultsProps> = ({
  onReset,
  message = "Нет предложений, соответствующих фильтрам",
}) => {
  return (
    <div className="no-results">
      <p>{message}</p>
      <button onClick={onReset}>Сбросить фильтры</button>
    </div>
  );
};
