import type React from "react";
import { useCallback, useEffect, useState } from "react";

import type { SkillTree } from "../../domain/types.js";
import { discoverSkills } from "../../services/discovery.js";
import { resolveSource, syncSource } from "../../services/source.js";

type LoadMode = "initial" | "refresh";

interface UseSkillTreeStateParams {
  sourceArg: string;
  targetCwd: string;
}

interface UseSkillTreeStateResult {
  tree: SkillTree | null;
  setTree: React.Dispatch<React.SetStateAction<SkillTree | null>>;
  busy: boolean;
  status: string;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  activeSourceArg: string;
  loadTree: (mode: LoadMode) => Promise<void>;
}

export function useSkillTreeState({
  sourceArg,
  targetCwd,
}: UseSkillTreeStateParams): UseSkillTreeStateResult {
  const [tree, setTree] = useState<SkillTree | null>(null);
  const [status, setStatus] = useState("Loading source...");
  const [busy, setBusy] = useState(true);
  const [activeSourceArg, setActiveSourceArg] = useState(sourceArg);

  const loadTree = useCallback(
    async (mode: LoadMode) => {
      setBusy(true);
      setStatus(mode === "initial" ? "Loading source..." : "Refreshing source...");

      try {
        const resolved = await resolveSource(sourceArg, targetCwd);
        const synced = await syncSource(resolved, mode);
        const discovered = await discoverSkills(synced.localPath);

        setTree(discovered);
        setActiveSourceArg(resolved.originalSourceArg);
        if (discovered.warnings.length > 0) {
          setStatus(
            `${mode === "initial" ? "Source loaded" : "Source refreshed"} with ${discovered.warnings.length} warning${discovered.warnings.length === 1 ? "" : "s"}.`,
          );
        } else {
          setStatus(mode === "initial" ? "Source loaded." : "Source refreshed.");
        }
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

  return {
    tree,
    setTree,
    busy,
    status,
    setStatus,
    activeSourceArg,
    loadTree,
  };
}
