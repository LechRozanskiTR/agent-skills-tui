import fuzzysort from "fuzzysort";

import type { SkillNode, SkillTree } from "./types.js";

function isMatchingSkill(node: SkillNode, query: string): boolean {
  if (node.kind !== "skill" || !node.skillMeta) {
    return false;
  }

  return fuzzysort.single(query, node.skillMeta.name) !== null;
}

export function filterTreeBySkillName(tree: SkillTree, query: string): Set<string> {
  const visible = new Set<string>();
  const trimmedQuery = query.trim();

  if (trimmedQuery.length === 0) {
    for (const id of Object.keys(tree.nodes)) {
      visible.add(id);
    }

    return visible;
  }

  const addAncestors = (nodeId: string): void => {
    let currentId: string | null = nodeId;
    while (currentId) {
      visible.add(currentId);
      currentId = tree.nodes[currentId]?.parentId ?? null;
    }
  };

  for (const node of Object.values(tree.nodes)) {
    if (isMatchingSkill(node, trimmedQuery)) {
      addAncestors(node.id);
    }
  }

  visible.add(tree.rootId);
  return visible;
}
