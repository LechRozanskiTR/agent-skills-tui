import type React from "react";
import { createContext, useContext } from "react";

import { type AppTheme, defaultTheme } from "./theme.js";

const ThemeContext = createContext<AppTheme | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: AppTheme;
}

export function ThemeProvider({ children, theme = defaultTheme }: ThemeProviderProps) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }
  return theme;
}
