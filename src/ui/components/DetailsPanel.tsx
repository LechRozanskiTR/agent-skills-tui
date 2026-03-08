import { Text } from "ink";

import type { SkillNode } from "../../domain/types.js";
import { useTheme } from "../theme/ThemeProvider.js";
import { formatFrontmatterKey, normalizeFrontmatterValue } from "../utils/text.js";
import { Panel } from "./Panel.js";

interface DetailsPanelProps {
  activeNode?: SkillNode;
  previewEntries: Array<[string, unknown]>;
}

export function DetailsPanel({ activeNode, previewEntries }: DetailsPanelProps) {
  const theme = useTheme();

  return (
    <Panel title="Details" variant="secondary" bodyPaddingY={1} flexShrink={1}>
      {activeNode?.kind === "skill" ? (
        activeNode.errorMessage ? (
          <Text color={theme.colors.danger}>{activeNode.errorMessage}</Text>
        ) : previewEntries.length > 0 ? (
          previewEntries.map(([key, value]) => (
            <Text key={key} color={theme.colors.footerText}>
              <Text color={theme.colors.footerAccent}>{formatFrontmatterKey(key)}:</Text>{" "}
              {normalizeFrontmatterValue(value)}
            </Text>
          ))
        ) : (
          <Text color={theme.colors.footerText}>(No frontmatter fields)</Text>
        )
      ) : (
        <Text color={theme.colors.footerText}>Move to a skill to preview its details.</Text>
      )}
    </Panel>
  );
}
