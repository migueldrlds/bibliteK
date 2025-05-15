"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="tec" 
      enableSystem
      themes={["light", "dark", "tec", "system"]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}