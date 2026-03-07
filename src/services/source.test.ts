import path from "node:path";

import { describe, expect, it } from "vitest";

import { resolveSource } from "./source.js";

const cwd = process.cwd();

describe("resolveSource", () => {
  it("resolves an existing local path", async () => {
    const sourceArg = "./testdata/local-nested-skills";
    const result = await resolveSource(sourceArg, cwd);

    expect(result.sourceKind).toBe("local");
    expect(result.resolvedLocalPath).toBe(path.resolve(cwd, sourceArg));
    expect(result.originalSourceArg).toBe(sourceArg);
  });

  it("resolves GitHub shorthand as remote", async () => {
    const result = await resolveSource("openai/agent-skills", cwd);

    expect(result.sourceKind).toBe("remote");
    expect(result.remoteCloneUrl).toBe("https://github.com/openai/agent-skills.git");
    expect(result.tempCheckoutPath).toContain(path.join("agent-skills-tui", "agent-skills"));
    expect(result.originalSourceArg).toBe("openai/agent-skills");
  });

  it("throws for unresolvable source strings", async () => {
    await expect(resolveSource("not-a-path-or-remote", cwd)).rejects.toThrow(
      "Unable to resolve source",
    );
  });
});
