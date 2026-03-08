import { Box, Text } from "ink";

import type { SkillNode, VisibleNode } from "../../domain/types.js";
import { useTheme } from "../theme/ThemeProvider.js";
import {
  getSelectionBackground,
  nodeIcon,
  rowPrefix,
  selectionMark,
} from "../utils/presentation.js";

interface SkillTreeRowProps {
  row: VisibleNode;
  node: SkillNode;
  isActive: boolean;
}

export function SkillTreeRow({ row, node, isActive }: SkillTreeRowProps) {
  const theme = useTheme();
  const rowColor =
    node.kind === "group"
      ? theme.colors.group
      : node.errorMessage
        ? theme.colors.danger
        : theme.colors.skill;
  const activeBackground = getSelectionBackground(theme, node);
  const activeTextColor = node.errorMessage
    ? theme.colors.danger
    : node.kind === "group"
      ? theme.colors.group
      : theme.colors.skill;
  const mark = selectionMark(node.selection);
  const indent = "  ".repeat(row.depth);
  const icon = nodeIcon(node);
  const skillLabel = node.kind === "skill" && node.skillMeta ? node.skillMeta.name : node.label;
  const isSplitSkillRow = !isActive && node.kind === "skill";
  const contentBackground = isActive
    ? activeBackground
    : node.kind === "skill"
      ? theme.colors.panelMuted
      : theme.colors.panelHelp;
  const prefixBackground = isActive ? activeBackground : theme.colors.panelHelp;
  const checkboxColor = node.errorMessage ? theme.colors.danger : rowColor;

  return (
    <Box>
      <Box backgroundColor={prefixBackground} width={2}>
        <Text
          color={isActive ? activeTextColor : theme.colors.muted}
        >{`${rowPrefix(isActive)} `}</Text>
      </Box>
      <Box backgroundColor={contentBackground} flexGrow={1}>
        <Text color={isActive ? activeTextColor : theme.colors.muted}>{indent}</Text>
        {node.kind === "group" ? (
          <Text color={isActive ? activeTextColor : theme.colors.group}>{`${icon} `}</Text>
        ) : isSplitSkillRow ? (
          <Text color={theme.colors.panelMuted}> </Text>
        ) : (
          <Text color={isActive ? activeTextColor : theme.colors.muted}> </Text>
        )}
        <Text color={isActive ? activeTextColor : checkboxColor}>
          {node.errorMessage ? "[!] " : `${mark} `}
        </Text>
        <Text
          bold={node.kind === "group"}
          color={isActive ? activeTextColor : rowColor}
          wrap="truncate-end"
        >
          {skillLabel}
        </Text>
      </Box>
    </Box>
  );
}
