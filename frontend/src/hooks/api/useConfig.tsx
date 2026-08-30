// src/hooks/api/useConfig.ts

import { useState, useEffect } from "react";
import { ConfigData } from "../../utils/types";

export const useConfig = () => {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/config");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          setConfig(result.data);
        } else {
          setError(result.error || "Failed to load config");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading config");
        console.error("Error loading config:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading, error };
};
