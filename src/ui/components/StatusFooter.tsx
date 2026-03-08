import { Box, Text } from "ink";
import type { ReactNode } from "react";

import type { FooterShortcut } from "../constants.js";
import { useTheme } from "../theme/ThemeProvider.js";
import { getStatusColor } from "../utils/presentation.js";
import { truncateText } from "../utils/text.js";
import { ShortcutHint } from "./ShortcutHint.js";

interface StatusFooterProps {
  shortcuts: FooterShortcut[];
  showFooterSource: boolean;
  footerSourceText: string;
  footerStatusText: string;
  footerStatusMaxLength: number;
  query: string;
  status: string;
}

export function StatusFooter({
  shortcuts,
  showFooterSource,
  footerSourceText,
  footerStatusText,
  footerStatusMaxLength,
  query,
  status,
}: StatusFooterProps) {
  const theme = useTheme();
  let statusColor = getStatusColor(theme, status);

  if (query) {
    statusColor = theme.colors.warning;
  }
  const shortcutItems = shortcuts.map((shortcut, index) => {
    let separatorContent: ReactNode = null;

    if (index > 0) {
      separatorContent = <Text color={theme.colors.footerSeparator}> · </Text>;
    }

    return (
      <Box key={`${shortcut.label}-${shortcut.action}`} flexDirection="row">
        {separatorContent}
        <ShortcutHint action={shortcut.action} label={shortcut.label} />
      </Box>
    );
  });

  return (
    <Box
      backgroundColor={theme.colors.panel}
      justifyContent="space-between"
      paddingX={1}
      paddingY={0}
    >
      <Box flexDirection="row">{shortcutItems}</Box>
      <Box flexDirection="row" flexShrink={1} marginLeft={1}>
        {showFooterSource && (
          <>
            <Text color={theme.colors.muted} wrap="truncate-start">
              {footerSourceText}
            </Text>
            <Text color={theme.colors.footerSeparator}> · </Text>
          </>
        )}
        <Text color={statusColor} wrap="truncate-start">
          {truncateText(footerStatusText, footerStatusMaxLength)}
        </Text>
      </Box>
    </Box>
  );
}
