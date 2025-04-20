
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Simplificamos para evitar problemas de tipos
export function ThemeProvider({ children, ...props }: any) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
