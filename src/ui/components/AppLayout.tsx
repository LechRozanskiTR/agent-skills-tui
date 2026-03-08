import { Box } from "ink";
import type React from "react";

import { useTheme } from "../theme/ThemeProvider.js";

interface AppLayoutProps {
  stdoutWidth: number;
  stdoutHeight: number;
  mainHeight: number;
  sidebarWidth: number;
  sidebar: React.ReactNode;
  details: React.ReactNode;
  shortcuts?: React.ReactNode;
  searchBar?: React.ReactNode;
  footer: React.ReactNode;
}

export function AppLayout({
  stdoutWidth,
  stdoutHeight,
  mainHeight,
  sidebarWidth,
  sidebar,
  details,
  shortcuts,
  searchBar,
  footer,
}: AppLayoutProps) {
  const theme = useTheme();

  return (
    <Box
      backgroundColor={theme.colors.shell}
      flexDirection="column"
      height={stdoutHeight}
      width={stdoutWidth}
    >
      <Box
        backgroundColor={theme.colors.shell}
        flexDirection="row"
        height={mainHeight}
        width={stdoutWidth}
      >
        <Box
          backgroundColor={theme.panelVariants.primary.surface}
          flexBasis={sidebarWidth}
          flexDirection="column"
          flexGrow={0}
          flexShrink={0}
          height={mainHeight}
          width={sidebarWidth}
        >
          {sidebar}
        </Box>
        <Box
          backgroundColor={theme.colors.panelRightMuted}
          flexDirection="column"
          flexGrow={1}
          flexShrink={1}
          height={mainHeight}
          justifyContent="space-between"
          overflow="hidden"
        >
          {details}
          {shortcuts}
        </Box>
      </Box>
      {searchBar}
      {footer}
    </Box>
  );
}
