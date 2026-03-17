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
const lockfilePath = join(repoRoot, "pnpm-lock.yaml");
const releaseDir = join(repoRoot, "release");
const stagingDir = join(repoRoot, ".release-staging");
const runtimeTemplateDir = join(stagingDir, "runtime-template");
const unixAppDir = join(stagingDir, "agent-skills-tui");
const windowsAppDir = join(stagingDir, "agent-skills-tui-windows");
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

function createReleasePackageJson(sourcePackageJson) {
  return {
    name: sourcePackageJson.name,
    version: sourcePackageJson.version,
    description: sourcePackageJson.description,
    type: "module",
    private: true,
    bin: {
      "agent-skills-tui": "dist/cli.js",
    },
    engines: sourcePackageJson.engines,
  };
}

function prepareRuntimeTemplate(targetDir) {
  mkdirSync(join(targetDir, "dist"), { recursive: true });
  cpSync(packageJsonPath, join(targetDir, "package.json"));
  cpSync(lockfilePath, join(targetDir, "pnpm-lock.yaml"));
  cpSync(join(repoRoot, "dist", "cli.js"), join(targetDir, "dist", "cli.js"));
  run(
    commandName("pnpm"),
    ["install", "--prod", "--frozen-lockfile", "--config.node-linker=hoisted"],
    targetDir,
  );
}

function copyRuntimeFiles(sourceDir, targetDir, version, sourcePackageJson) {
  const distDir = join(sourceDir, "dist");
  const nodeModulesDir = join(sourceDir, "node_modules");

  if (!existsSync(distDir)) {
    throw new Error(`Expected deployed dist directory at ${distDir}`);
  }

  if (!existsSync(nodeModulesDir)) {
    throw new Error(`Expected deployed node_modules directory at ${nodeModulesDir}`);
  }

  mkdirSync(targetDir, { recursive: true });
  cpSync(distDir, join(targetDir, "dist"), { recursive: true });
  cpSync(nodeModulesDir, join(targetDir, "node_modules"), { recursive: true });
  cpSync(join(repoRoot, "README.md"), join(targetDir, "README.md"));
  cpSync(join(repoRoot, "LICENSE"), join(targetDir, "LICENSE"));
  writeFileSync(
    join(targetDir, "package.json"),
    `${JSON.stringify(createReleasePackageJson(sourcePackageJson), null, 2)}\n`,
  );
  writeFileSync(join(targetDir, "VERSION"), `${version}\n`);
}

function writeUnixLauncher(appDir) {
  const binDir = join(appDir, "bin");
  const launcherPath = join(binDir, "agent-skills-tui");

  mkdirSync(binDir, { recursive: true });
  writeFileSync(
    launcherPath,
    [
      "#!/usr/bin/env sh",
      'SOURCE="$0"',
      'while [ -L "$SOURCE" ]; do',
      '  TARGET="$(readlink "$SOURCE")"',
      '  case "$TARGET" in',
      '    /*) SOURCE="$TARGET" ;;',
      '    *) SOURCE="$(dirname "$SOURCE")/$TARGET" ;;',
      "  esac",
      "done",
      'SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$SOURCE")" && pwd)"',
      'exec node "$SCRIPT_DIR/../dist/cli.js" "$@"',
      "",
    ].join("\n"),
  );
  chmodSync(launcherPath, 0o755);
}

function writeWindowsLauncher(appDir) {
  const binDir = join(appDir, "bin");
  const cmdPath = join(binDir, "agent-skills-tui.cmd");
  const ps1Path = join(binDir, "agent-skills-tui.ps1");

  mkdirSync(binDir, { recursive: true });
  writeFileSync(
    cmdPath,
    ["@echo off", "setlocal", 'node "%~dp0..\\dist\\cli.js" %*', "exit /b %ERRORLEVEL%", ""].join(
      "\r\n",
    ),
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
      '& node (Join-Path $scriptDir "..\\dist\\cli.js") @Arguments',
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
  run(commandName("pnpm"), ["build"]);
  prepareRuntimeTemplate(runtimeTemplateDir);

  copyRuntimeFiles(runtimeTemplateDir, unixAppDir, version, packageJson);
  copyRuntimeFiles(runtimeTemplateDir, windowsAppDir, version, packageJson);
  writeUnixLauncher(unixAppDir);
  writeWindowsLauncher(windowsAppDir);

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
