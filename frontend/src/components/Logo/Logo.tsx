// frontend/src/components/Logo/Logo.tsx

import React from "react";
import { Link } from "react-router-dom";
import "./Logo.css";

type LogoVariant = "light" | "dark";

interface LogoProps {
  size?: "small" | "medium" | "large";
  linkTo?: string | null;
  variant?: LogoVariant;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = "medium",
  linkTo = "/",
  variant = "light",
  className = "",
}) => {
  const content = (
    <span
      className={`logo-text logo-${size} logo-variant-${variant} ${className}`.trim()}
    >
      Ipoteka
      <span className="logo-highlight">Partner</span>
    </span>
  );

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className="logo-link"
        aria-label="IpotekaPartner — на главную"
      >
        {content}
      </Link>
    );
  }

  return content;
};
