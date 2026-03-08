import { Box } from "ink";

import { Panel } from "./Panel.js";
import { ShortcutHint } from "./ShortcutHint.js";

const SHORTCUT_HINTS = [
  { label: "up/down", action: "move cursor" },
  { label: "left/right", action: "collapse/expand" },
  { label: "space", action: "toggle" },
  { label: "f", action: "search" },
  { label: "r", action: "refresh" },
  { label: "enter", action: "install" },
  { label: "q", action: "quit" },
  { label: "?", action: "toggle shortcuts" },
] as const;

interface ShortcutsPanelProps {
  showHelp: boolean;
}

export function ShortcutsPanel({ showHelp }: ShortcutsPanelProps) {
  if (!showHelp) {
    return null;
  }

  return (
    <Panel
      bodyPaddingY={0}
      flexShrink={1}
      overflow="hidden"
      title="Keyboard Shortcuts"
      variant="secondary"
    >
      <Box
        columnGap={2}
        flexDirection="row"
        flexWrap="wrap"
        justifyContent="space-between"
        overflow="hidden"
      >
        {SHORTCUT_HINTS.map((shortcut) => (
          <Box key={`${shortcut.label}-${shortcut.action}`} overflow="hidden" paddingRight={2}>
            <ShortcutHint action={shortcut.action} label={shortcut.label} />
          </Box>
        ))}
      </Box>
    </Panel>
  );
}
