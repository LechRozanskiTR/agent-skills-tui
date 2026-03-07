import { Box, type Key, Text, useApp, useInput } from "ink";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { filterTreeBySkillName } from "../domain/search.js";
import {
  flattenVisibleTree,
  getAncestorIds,
  getSelectedSkills,
  setExpanded,
  toggleSelection,
} from "../domain/tree.js";
import type { SkillTree, VisibleNode } from "../domain/types.js";
import { discoverSkills } from "../services/discovery.js";
import { resolveSource, syncSource } from "../services/source.js";

const PREVIEW_HEIGHT = 5;

export interface AppExitResult {
  kind: "quit" | "install";
  selectedSkillNames?: string[];
  sourceArg?: string;
}

interface AppProps {
  sourceArg: string;
  targetCwd: string;
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

function rowPrefix(isCursor: boolean): string {
  return isCursor ? ">" : " ";
}

function selectionMark(selection: "checked" | "unchecked" | "partial"): string {
  if (selection === "checked") {
    return "[x]";
  }

  if (selection === "partial") {
    return "[-]";
  }

  return "[ ]";
}

function formatNodeRow(
  tree: SkillTree,
  row: VisibleNode,
  cursorIndex: number,
  rowIndex: number,
): string {
  const node = tree.nodes[row.id];
  const indent = "  ".repeat(row.depth);
  const branch = node.kind === "group" ? (node.expanded ? "▾" : "▸") : "•";
  const skillLabel = node.kind === "skill" && node.skillMeta ? node.skillMeta.name : node.label;

  return `${rowPrefix(cursorIndex === rowIndex)} ${indent}${selectionMark(node.selection)} ${branch} ${skillLabel}`;
}

export function App({ sourceArg, targetCwd }: AppProps): React.JSX.Element {
  const { exit } = useApp();
  const [tree, setTree] = useState<SkillTree | null>(null);
  const [cursorIndex, setCursorIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const [status, setStatus] = useState("Loading source...");
  const [busy, setBusy] = useState(true);
  const [activeSourceArg, setActiveSourceArg] = useState(sourceArg);

  const loadTree = useCallback(
    async (mode: "initial" | "refresh") => {
      setBusy(true);
      setStatus(mode === "initial" ? "Loading source..." : "Refreshing source...");

      try {
        const resolved = await resolveSource(sourceArg, targetCwd);
        const synced = await syncSource(resolved, mode);
        const discovered = await discoverSkills(synced.localPath);

        setTree(discovered);
        setCursorIndex(0);
        setActiveSourceArg(resolved.originalSourceArg);
        setStatus(mode === "initial" ? "Source loaded." : "Source refreshed.");
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setStatus(message);
        setTree((currentTree) => currentTree);
      } finally {
        setBusy(false);
      }
    },
    [sourceArg, targetCwd],
  );

  useEffect(() => {
    void loadTree("initial");
  }, [loadTree]);

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

  useEffect(() => {
    if (visibleRows.length === 0) {
      setCursorIndex(0);
      return;
    }

    setCursorIndex((currentIndex) => Math.max(0, Math.min(currentIndex, visibleRows.length - 1)));
  }, [visibleRows.length]);

  const selectedSkills = useMemo(() => {
    if (!tree) {
      return [];
    }

    return getSelectedSkills(tree);
  }, [tree]);

  const activeRow = visibleRows[cursorIndex];
  const activeNode = tree && activeRow ? tree.nodes[activeRow.id] : undefined;
  const previewDescription =
    activeNode?.kind === "skill"
      ? activeNode.skillMeta?.description || "(No description)"
      : "Move to a skill to preview its description.";

  const moveCursor = useCallback(
    (delta: number): void => {
      if (visibleRows.length === 0) {
        return;
      }

      setCursorIndex((currentIndex) => {
        const nextIndex = currentIndex + delta;
        return Math.max(0, Math.min(visibleRows.length - 1, nextIndex));
      });
    },
    [visibleRows.length],
  );

  const collapseAtCursor = useCallback((): void => {
    if (!tree || !activeNode) {
      return;
    }

    if (activeNode.kind === "group" && activeNode.expanded) {
      setTree(setExpanded(tree, activeNode.id, false));
      return;
    }

    if (!activeNode.parentId) {
      return;
    }

    const parentVisibleIndex = visibleRows.findIndex((row) => row.id === activeNode.parentId);
    if (parentVisibleIndex >= 0) {
      setCursorIndex(parentVisibleIndex);
    }
  }, [tree, activeNode, visibleRows]);

  const expandAtCursor = useCallback((): void => {
    if (!tree || !activeNode || activeNode.kind !== "group") {
      return;
    }

    setTree(setExpanded(tree, activeNode.id, true));
  }, [tree, activeNode]);

  const toggleAtCursor = useCallback((): void => {
    if (!tree || !activeNode) {
      return;
    }

    const visibleScope = query.trim().length > 0 ? visibleNodeIds : undefined;
    setTree(toggleSelection(tree, activeNode.id, visibleScope));
  }, [tree, activeNode, query, visibleNodeIds]);

  const confirmInstall = useCallback((): void => {
    if (!tree) {
      setStatus("No skill tree loaded.");
      return;
    }

    const chosen = getSelectedSkills(tree).map((skill) => skill.name);
    if (chosen.length === 0) {
      setStatus("Empty selection. Choose at least one skill before install.");
      return;
    }

    exit({
      kind: "install",
      selectedSkillNames: chosen,
      sourceArg: activeSourceArg,
    } satisfies AppExitResult);
  }, [tree, activeSourceArg, exit]);

  const handleInput = useCallback(
    (input: string, key: Key) => {
      if (searchMode) {
        if (key.escape) {
          setQuery("");
          setSearchInput("");
          setSearchMode(false);
          setStatus("Search cleared.");
          return;
        }

        if (key.return) {
          setSearchMode(false);
          setStatus(searchInput ? `Search active: "${searchInput}"` : "Search cleared.");
          return;
        }

        if (key.backspace || key.delete) {
          setSearchInput((current) => {
            const next = current.slice(0, -1);
            setQuery(next);
            return next;
          });
          return;
        }

        if (!key.ctrl && !key.meta && input.length > 0) {
          setSearchInput((current) => {
            const next = `${current}${input}`;
            setQuery(next);
            return next;
          });
        }

        return;
      }

      if (input === "q") {
        exit({ kind: "quit" } satisfies AppExitResult);
        return;
      }

      if (input === "f") {
        setSearchMode(true);
        setSearchInput(query);
        setStatus("Search mode active.");
        return;
      }

      if (input === "r") {
        if (!busy) {
          void loadTree("refresh");
        }
        return;
      }

      if (!tree || busy) {
        return;
      }

      if (key.upArrow) {
        moveCursor(-1);
        return;
      }

      if (key.downArrow) {
        moveCursor(1);
        return;
      }

      if (key.return) {
        confirmInstall();
        return;
      }

      if (input === " ") {
        toggleAtCursor();
        return;
      }

      if (key.leftArrow || input === "h") {
        collapseAtCursor();
        return;
      }

      if (key.rightArrow || input === "l") {
        expandAtCursor();
      }
    },
    [
      searchMode,
      searchInput,
      query,
      exit,
      busy,
      tree,
      loadTree,
      moveCursor,
      confirmInstall,
      toggleAtCursor,
      collapseAtCursor,
      expandAtCursor,
    ],
  );

  useInput((input, key) => {
    handleInput(input, key);
  });

  const hints = searchMode
    ? "search: type | backspace edit | enter=apply | esc=clear"
    : "up/down move | left/right collapse/expand | space toggle | f search | r refresh | enter install | q quit";

  const activePathHint =
    activeNode && tree
      ? getAncestorIds(tree, activeNode.id).length > 0
        ? activeNode.absPath
        : ""
      : "";

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="cyan">Agent Skills TUI</Text>
      </Box>

      {searchMode ? (
        <Box marginBottom={1}>
          <Text color="yellow">Search: {searchInput}|</Text>
        </Box>
      ) : null}

      <Box flexDirection="column">
        {tree === null ? (
          <Text>
            {busy ? "Loading skill tree..." : "No skills available. Press r to retry or q to quit."}
          </Text>
        ) : visibleRows.length === 0 ? (
          <Text>No matching skills.</Text>
        ) : (
          visibleRows.map((row, rowIndex) => {
            const text = formatNodeRow(tree, row, cursorIndex, rowIndex);
            return (
              <Text key={row.id} color={rowIndex === cursorIndex ? "green" : undefined}>
                {text}
              </Text>
            );
          })
        )}
      </Box>

      <Box
        borderStyle="round"
        flexDirection="column"
        height={PREVIEW_HEIGHT}
        marginTop={1}
        paddingX={1}
      >
        <Text color="magenta">Description</Text>
        <Text>{truncateText(previewDescription, 120)}</Text>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text>
          source={activeSourceArg} | target={targetCwd} | selected={selectedSkills.length}
          {query ? ` | query="${query}"` : ""}
          {searchMode ? " | mode=search" : " | mode=navigation"}
        </Text>
        <Text>{hints}</Text>
        <Text
          color={
            status.toLowerCase().includes("failed") || status.toLowerCase().includes("error")
              ? "red"
              : "gray"
          }
        >
          {status}
        </Text>
        {activePathHint ? <Text color="gray">{truncateText(activePathHint, 120)}</Text> : null}
      </Box>
    </Box>
  );
}
