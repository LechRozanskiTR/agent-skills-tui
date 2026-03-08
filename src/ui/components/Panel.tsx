import { Box, Text } from "ink";
import type React from "react";

import { useTheme } from "../theme/ThemeProvider.js";
import type { PanelVariant } from "../theme/theme.js";

export interface PanelProps {
  title: string;
  variant: PanelVariant;
  rightText?: React.ReactNode;
  children: React.ReactNode;
  flexGrow?: number;
  flexShrink?: number;
  overflow?: "hidden" | "visible";
  bodyPaddingX?: number;
  bodyPaddingY?: number;
}

export function Panel({
  title,
  variant,
  rightText,
  children,
  flexGrow,
  flexShrink,
  overflow,
  bodyPaddingX = variant === "primary" ? 1 : 0,
  bodyPaddingY = 1,
}: PanelProps) {
  const theme = useTheme();
  const variantTheme = theme.panelVariants[variant];
  const headerJustify = rightText ? "space-between" : "center";
  const containerPaddingX = variant === "secondary" ? 1 : 0;
  const headerMarginX = variant === "secondary" ? -1 : 0;

  return (
    <Box
      backgroundColor={variantTheme.surface}
      flexDirection="column"
      flexGrow={flexGrow}
      flexShrink={flexShrink}
      overflow={overflow}
      paddingX={containerPaddingX}
      paddingY={0}
    >
      <Box
        backgroundColor={variantTheme.header}
        justifyContent={headerJustify}
        marginX={headerMarginX}
        paddingX={1}
      >
        <Text bold color={theme.colors.accent}>
          {title}
        </Text>
        {typeof rightText === "string" || typeof rightText === "number" ? (
          <Text color={theme.colors.muted}>{rightText}</Text>
        ) : (
          rightText
        )}
      </Box>
      <Box flexDirection="column" paddingX={bodyPaddingX} paddingY={bodyPaddingY}>
        {children}
      </Box>
    </Box>
  );
}
