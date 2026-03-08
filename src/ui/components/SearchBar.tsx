import { Box, Text } from "ink";

import { useTheme } from "../theme/ThemeProvider.js";
import { ShortcutKey } from "./ShortcutHint.js";

interface SearchBarProps {
  searchInput: string;
}

export function SearchBar({ searchInput }: SearchBarProps) {
  const theme = useTheme();

  return (
    <Box
      backgroundColor={theme.colors.panelHelp}
      justifyContent="space-between"
      paddingX={1}
      paddingY={0}
    >
      <Text>
        <Text bold color={theme.colors.accent}>
          Search
        </Text>
        <Text color={theme.colors.footerSeparator}>: </Text>
        <Text color={theme.colors.text}>{searchInput}</Text>
        <Text color={theme.colors.footerSeparator}>_</Text>
      </Text>
      <Text color={theme.colors.footerText}>
        <ShortcutKey>enter</ShortcutKey> apply <Text color={theme.colors.footerSeparator}>·</Text>{" "}
        <ShortcutKey>esc</ShortcutKey> clear
      </Text>
    </Box>
  );
}
