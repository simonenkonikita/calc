import React from "react";

interface BankLogoProps {
  bankName: string;
  size?: "small" | "medium" | "large";
}

export const BankLogo: React.FC<BankLogoProps> = ({
  bankName,
  size = "medium",
}) => {
  const getLogoSrc = (bank: string): string => {
    // Маппинг названий банков на пути к логотипам
    const logoMap: Record<string, string> = {
      Сбербанк: "/logos/sberbank.svg",
      "Альфа-Банк": "/logos/alfabank.svg",
      ВТБ: "/logos/vtb.svg",
      Совкомбанк: "/logos/sovcombank.svg",
      "Дом.РФ Банк": "/logos/domrf.svg",
      Уралсиб: "/logos/uralsib.svg",
    };

    return logoMap[bank] || "/logos/default-bank.svg";
  };

  const sizeMap = {
    small: 24,
    medium: 32,
    large: 48,
  };

  const logoSize = sizeMap[size] || 32;

  return (
    <img
      src={getLogoSrc(bankName)}
      alt={`${bankName} логотип`}
      className="bank-logo"
      style={{
        width: logoSize,
        height: logoSize,
        objectFit: "contain",
        flexShrink: 0,
      }}
      onError={(e) => {
        // Если логотип не загрузился, показываем первую букву банка
        const target = e.target as HTMLImageElement;
        target.style.display = "none";
        const parent = target.parentElement;
        if (parent) {
          const fallback = document.createElement("span");
          fallback.className = "bank-logo-fallback";
          fallback.textContent = bankName.charAt(0);
          fallback.style.cssText = `
            width: ${logoSize}px;
            height: ${logoSize}px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #e2e8f0;
            border-radius: 50%;
            font-weight: 700;
            font-size: ${logoSize / 2}px;
            color: #64748b;
            flex-shrink: 0;
          `;
          parent.appendChild(fallback);
        }
      }}
    />
  );
};
