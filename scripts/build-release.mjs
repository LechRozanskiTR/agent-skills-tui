#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = resolve(__dirname, "..");
const packageJsonPath = join(repoRoot, "package.json");
const releaseDir = join(repoRoot, "release");
const stagingDir = join(repoRoot, ".release-staging");
const unixAppDir = join(stagingDir, "agent-skills-tui");
const windowsAppDir = join(stagingDir, "agent-skills-tui-windows");
const distCliPath = join(repoRoot, "dist", "cli.js");
const unixAssetName = "agent-skills-tui.tar.gz";
const windowsAssetName = "agent-skills-tui-windows.zip";
const checksumsName = "checksums.txt";

function run(command, args, cwd = repoRoot) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

function commandName(base) {
  if (process.platform === "win32" && base === "pnpm") {
    return "pnpm.cmd";
  }

  return base;
}

function writeWindowsLauncher(targetDir) {
  const cmdPath = join(targetDir, "agent-skills-tui.cmd");
  const ps1Path = join(targetDir, "agent-skills-tui.ps1");
  const jsPath = join(targetDir, "agent-skills-tui.js");

  cpSync(distCliPath, jsPath);

  writeFileSync(
    cmdPath,
    [
      "@echo off",
      "setlocal",
      'node "%~dp0agent-skills-tui.js" %*',
      "exit /b %ERRORLEVEL%",
      "",
    ].join("\r\n"),
  );

  writeFileSync(
    ps1Path,
    [
      "param(",
      "  [Parameter(ValueFromRemainingArguments = $true)]",
      "  [string[]]$Arguments",
      ")",
      "",
      "$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path",
      '& node (Join-Path $scriptDir "agent-skills-tui.js") @Arguments',
      "exit $LASTEXITCODE",
      "",
    ].join("\r\n"),
  );
}

function sha256ForFile(path) {
  const hash = createHash("sha256");
  hash.update(readFileSync(path));
  return hash.digest("hex");
}

function main() {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  const version = packageJson.version;

  rmSync(releaseDir, { recursive: true, force: true });
  rmSync(stagingDir, { recursive: true, force: true });

  mkdirSync(releaseDir, { recursive: true });
  mkdirSync(join(unixAppDir, "bin"), { recursive: true });
  mkdirSync(join(windowsAppDir, "bin"), { recursive: true });

  run(commandName("pnpm"), ["build"]);

  if (!existsSync(distCliPath)) {
    throw new Error(`Expected bundled CLI at ${distCliPath}`);
  }

  const unixBinaryPath = join(unixAppDir, "bin", "agent-skills-tui");
  cpSync(distCliPath, unixBinaryPath);
  chmodSync(unixBinaryPath, 0o755);

  writeWindowsLauncher(join(windowsAppDir, "bin"));

  cpSync(join(repoRoot, "README.md"), join(unixAppDir, "README.md"));
  cpSync(join(repoRoot, "LICENSE"), join(unixAppDir, "LICENSE"));
  cpSync(join(repoRoot, "README.md"), join(windowsAppDir, "README.md"));
  cpSync(join(repoRoot, "LICENSE"), join(windowsAppDir, "LICENSE"));

  writeFileSync(join(unixAppDir, "VERSION"), `${version}\n`);
  writeFileSync(join(windowsAppDir, "VERSION"), `${version}\n`);

  run("tar", ["-czf", join(releaseDir, unixAssetName), basename(unixAppDir)], stagingDir);

  if (process.platform === "win32") {
    run(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Compress-Archive -Path '${basename(windowsAppDir)}' -DestinationPath '${join(
          releaseDir,
          windowsAssetName,
        )}' -Force`,
      ],
      stagingDir,
    );
  } else {
    run("zip", ["-rq", join(releaseDir, windowsAssetName), basename(windowsAppDir)], stagingDir);
  }

  const checksumLines = [unixAssetName, windowsAssetName].map((assetName) => {
    const absolutePath = join(releaseDir, assetName);
    return `${sha256ForFile(absolutePath)}  ${assetName}`;
  });
  writeFileSync(join(releaseDir, checksumsName), `${checksumLines.join("\n")}\n`);

  rmSync(stagingDir, { recursive: true, force: true });

  console.log(`Created release assets in ${releaseDir}`);
}

main();
