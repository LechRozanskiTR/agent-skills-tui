import { describe, expect, it } from "vitest";

import { buildInstallCommand } from "./install.js";

describe("buildInstallCommand", () => {
  it("creates a single npx skills add invocation with deduped skill names", () => {
    const command = buildInstallCommand({
      originalSourceArg: "openai/skills",
      selectedSkillNames: ["a", "b", "a"],
      cwd: "/tmp/target",
    });

    expect(command.cmd).toBe("npx");
    expect(command.args).toEqual([
      "skills",
      "add",
      "openai/skills",
      "--skill",
      "a",
      "--skill",
      "b",
    ]);
    expect(command.cwd).toBe("/tmp/target");
  });
});
