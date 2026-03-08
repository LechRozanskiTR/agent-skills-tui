import { Text } from "ink";
import type React from "react";

import { useTheme } from "../theme/ThemeProvider.js";

interface ShortcutKeyProps {
  children: React.ReactNode;
}

export function ShortcutKey({ children }: ShortcutKeyProps) {
  const theme = useTheme();

  return <Text color={theme.colors.footerAccent}>{children}</Text>;
}

interface ShortcutHintProps {
  label: string;
  action: string;
}

export function ShortcutHint({ label, action }: ShortcutHintProps) {
  const theme = useTheme();

  return (
    <Text color={theme.colors.footerText}>
      <ShortcutKey>{label}</ShortcutKey> {action}
    </Text>
  );
}
