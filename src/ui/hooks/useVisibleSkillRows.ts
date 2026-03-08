import { useCallback, useMemo } from "react";

import { filterTreeBySkillName } from "../../domain/search.js";
import { flattenVisibleTree, getSelectedSkills } from "../../domain/tree.js";
import type { SkillTree } from "../../domain/types.js";

interface UseVisibleSkillRowsParams {
  tree: SkillTree | null;
  query: string;
  cursorIndex: number;
}

export function useVisibleSkillRows({ tree, query, cursorIndex }: UseVisibleSkillRowsParams) {
  const visibleNodeIds = useMemo(() => {
    if (!tree) {
      return new Set<string>();
    }

    return filterTreeBySkillName(tree, query);
  }, [tree, query]);

  const visibleRows = useMemo(() => {
    if (!tree) {
      return [];
    }

    return flattenVisibleTree(tree, visibleNodeIds, query.trim().length > 0);
  }, [tree, visibleNodeIds, query]);

  const selectedSkills = useMemo(() => {
    if (!tree) {
      return [];
    }

    return getSelectedSkills(tree);
  }, [tree]);

  const activeRow = visibleRows[cursorIndex];
  const activeNode = tree && activeRow ? tree.nodes[activeRow.id] : undefined;
  const previewEntries =
    activeNode?.kind === "skill" && activeNode.skillMeta
      ? Object.entries(activeNode.skillMeta.frontmatter)
      : [];

  const getRowIndexForQuery = useCallback(
    (nodeId: string, nextQuery: string): number => {
      if (!tree) {
        return -1;
      }

      const nextVisibleNodeIds = filterTreeBySkillName(tree, nextQuery);
      const nextVisibleRows = flattenVisibleTree(
        tree,
        nextVisibleNodeIds,
        nextQuery.trim().length > 0,
      );
      return nextVisibleRows.findIndex((row) => row.id === nodeId);
    },
    [tree],
  );

  return {
    visibleNodeIds,
    visibleRows,
    selectedSkills,
    activeRow,
    activeNode,
    previewEntries,
    getRowIndexForQuery,
  };
}
