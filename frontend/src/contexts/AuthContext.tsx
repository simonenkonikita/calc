// frontend/src/contexts/AuthContext.tsx
import { createContext } from "react";
import { AuthContextType } from "../types/auth.types";

// 🔥 Только контекст, без компонента
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
