import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { ConfigData } from "../../utils/types";

export const useConfig = () => {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const response = await api.getConfig();
        if (response.success && response.data) {
          setConfig({
            depositAmount: response.data.depositAmount,
          });
        } else {
          setError(response.error || "Failed to load config");
        }
      } catch (err) {
        setError("Error loading config");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return { config, loading, error };
};
