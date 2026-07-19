// src/components/BankCard/BankCardBadges.tsx
import React from "react";
import "./BankCardBadge.css";

interface BankCardBadgesProps {
  badge: { text: string; icon: string } | null;
  limitBadge: { text: string; icon: string } | null;
  excessBadge: { text: string; icon: string } | null;
  termBadge: { text: string; icon: string } | null;
  trancheBadge: { text: string; icon: string } | null;
  badgeTwoContract: { text: string; icon: string } | null;
}

export const BankCardBadges: React.FC<BankCardBadgesProps> = ({
  badge,
  limitBadge,
  excessBadge,
  termBadge,
  trancheBadge,
  badgeTwoContract,
}) => {
  const badges = [
    {
      id: "badge",
      data: badge,
      className: "badge-promo", // Зеленый
    },
    {
      id: "limitBadge",
      data: limitBadge,
      className: "badge-excess", // Фиолетовый
    },
    {
      id: "excessBadge",
      data: excessBadge,
      className: "badge-excess", // Фиолетовый
    },
    {
      id: "badgeTwoContract",
      data: badgeTwoContract,
      className: "badge-excess", // Фиолетовый
    },
    {
      id: "termBadge",
      data: termBadge,
      className: "badge-term", // Красный
    },
    {
      id: "trancheBadge",
      data: trancheBadge,
      className: "badge-unavailable", // Зеленый
    },
  ];

  // Фильтруем только те бейджи, которые есть
  const visibleBadges = badges.filter(
    (b) => b.data !== null && b.data !== undefined,
  );

  // Если нет бейджей, ничего не рендерим
  if (visibleBadges.length === 0) {
    return null;
  }

  return (
    <div className="bank-card-badges">
      {visibleBadges.map(({ id, data, className }) => (
        <div key={id} className={`bank-card-badge ${className}`}>
          <span className="badge-icon">{data?.icon}</span>
          <span className="badge-text">{data?.text}</span>
        </div>
      ))}
    </div>
  );
};
