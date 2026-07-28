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
  loanTermBadge: { text: string; icon: string } | null;
}

export const BankCardBadges: React.FC<BankCardBadgesProps> = ({
  badge,
  limitBadge,
  excessBadge,
  termBadge,
  trancheBadge,
  badgeTwoContract,
  loanTermBadge,
}) => {
  const badges = [
    {
      id: "badge",
      data: badge,
      className: "badge-promo",
    },
    {
      id: "limitBadge",
      data: limitBadge,
      className: "badge-excess",
    },
    {
      id: "excessBadge",
      data: excessBadge,
      className: "badge-excess",
    },
    {
      id: "badgeTwoContract",
      data: badgeTwoContract,
      className: "badge-excess",
    },
    {
      id: "termBadge",
      data: termBadge,
      className: "badge-term",
    },
    {
      id: "trancheBadge",
      data: trancheBadge,
      className: "badge-unavailable",
    },
    {
      id: "loanTermBadge",
      data: loanTermBadge,
      className: "badge-unavailable",
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
