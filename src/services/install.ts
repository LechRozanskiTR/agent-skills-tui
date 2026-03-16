import { execa } from "execa";

export interface InstallParams {
  originalSourceArg: string;
  selectedSkillNames: string[];
  cwd: string;
}

export interface BuiltCommand {
  cmd: string;
  args: string[];
  cwd: string;
}

export function buildInstallCommand(params: InstallParams): BuiltCommand {
  const { originalSourceArg, selectedSkillNames, cwd } = params;
  const uniqueSkillNames = [...new Set(selectedSkillNames)];
  const args = ["-y", "skills", "add", originalSourceArg, "--full-depth"];

  for (const skillName of uniqueSkillNames) {
    args.push("--skill", skillName);
  }

  return {
    cmd: "npx",
    args,
    cwd,
  };
}

async function ensureNpxInstalled(): Promise<void> {
  try {
    await execa("npx", ["--version"]);
  } catch {
    throw new Error("npx was not found in PATH. Install Node.js/npm and retry.");
  }
}

export async function runInstall(params: InstallParams): Promise<void> {
  if (params.selectedSkillNames.length === 0) {
    throw new Error("No skills selected. Select at least one skill before installation.");
  }

  await ensureNpxInstalled();
  const command = buildInstallCommand(params);

  try {
    await execa(command.cmd, command.args, {
      cwd: command.cwd,
      stdio: "inherit",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Skill installation command failed: ${message}`);
  }
}
