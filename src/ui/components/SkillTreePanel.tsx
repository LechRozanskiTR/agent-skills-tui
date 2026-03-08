import { Text } from "ink";

import type { SkillTree, VisibleNode } from "../../domain/types.js";
import { useTheme } from "../theme/ThemeProvider.js";
import { Panel } from "./Panel.js";
import { SkillTreeRow } from "./SkillTreeRow.js";

interface SkillTreePanelProps {
  tree: SkillTree | null;
  busy: boolean;
  visibleListRows: VisibleNode[];
  listWindowStart: number;
  cursorIndex: number;
  selectedCount: number;
}

export function SkillTreePanel({
  tree,
  busy,
  visibleListRows,
  listWindowStart,
  cursorIndex,
  selectedCount,
}: SkillTreePanelProps) {
  const theme = useTheme();

  return (
    <Panel title="Skills" variant="primary" rightText={`${selectedCount} selected`} flexGrow={1}>
      {tree === null ? (
        <Text color={theme.colors.muted}>
          {busy ? "Loading skill tree..." : "No skills available. Press r to retry or q to quit."}
        </Text>
      ) : visibleListRows.length === 0 ? (
        <Text color={theme.colors.muted}>No matching skills.</Text>
      ) : (
        visibleListRows.map((row, rowIndex) => {
          const actualRowIndex = listWindowStart + rowIndex;
          const node = tree.nodes[row.id];

          return (
            <SkillTreeRow
              key={row.id}
              isActive={actualRowIndex === cursorIndex}
              node={node}
              row={row}
            />
          );
        })
      )}
    </Panel>
  );
}
