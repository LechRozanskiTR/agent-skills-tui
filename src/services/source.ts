import { constants } from "node:fs";
import { access, mkdir, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { execa } from "execa";

import { logErrorToStdout } from "../utils/logging.js";

export type SourceKind = "local" | "remote";

export interface ResolvedSource {
  originalSourceArg: string;
  sourceKind: SourceKind;
  resolvedLocalPath: string;
  remoteCloneUrl?: string;
  tempCheckoutPath?: string;
  repoName?: string;
}

export interface LocalCheckout {
  localPath: string;
}

const GITHUB_SHORTHAND_REGEX = /^[\w.-]+\/[\w.-]+$/;

function looksLikeGitUrl(input: string): boolean {
  return (
    input.startsWith("https://") ||
    input.startsWith("http://") ||
    input.startsWith("ssh://") ||
    input.startsWith("git@")
  );
}

function toCloneUrl(input: string): string {
  if (GITHUB_SHORTHAND_REGEX.test(input)) {
    return `https://github.com/${input}.git`;
  }

  return input;
}

function getRepoNameFromSource(source: string): string {
  if (GITHUB_SHORTHAND_REGEX.test(source)) {
    return source.split("/")[1];
  }

  if (source.startsWith("git@")) {
    const afterColon = source.split(":")[1] ?? source;
    return path.basename(afterColon, ".git");
  }

  try {
    const url = new URL(source);
    return path.basename(url.pathname, ".git");
  } catch {
    return path.basename(source, ".git");
  }
}

async function pathExists(absPath: string): Promise<boolean> {
  try {
    await stat(absPath);
    return true;
  } catch {
    return false;
  }
}

export async function resolveSource(sourceArg: string, cwd: string): Promise<ResolvedSource> {
  const absPath = path.resolve(cwd, sourceArg);

  if (await pathExists(absPath)) {
    await access(absPath, constants.R_OK);
    return {
      originalSourceArg: sourceArg,
      sourceKind: "local",
      resolvedLocalPath: absPath,
      repoName: path.basename(absPath),
    };
  }

  if (GITHUB_SHORTHAND_REGEX.test(sourceArg) || looksLikeGitUrl(sourceArg)) {
    const repoName = getRepoNameFromSource(sourceArg);
    const tempCheckoutPath = path.join(os.tmpdir(), "agent-skills-tui", repoName);

    return {
      originalSourceArg: sourceArg,
      sourceKind: "remote",
      resolvedLocalPath: tempCheckoutPath,
      remoteCloneUrl: toCloneUrl(sourceArg),
      tempCheckoutPath,
      repoName,
    };
  }

  throw new Error(`Unable to resolve source "${sourceArg}" as a local path or remote repository.`);
}

async function ensureGitInstalled(): Promise<void> {
  try {
    await execa("git", ["--version"]);
  } catch (error) {
    logErrorToStdout(error, "Failed to verify git availability:");
    throw new Error("git is required for remote sources but was not found in PATH.");
  }
}

export async function syncSource(
  source: ResolvedSource,
  _mode: "initial" | "refresh",
): Promise<LocalCheckout> {
  if (source.sourceKind === "local") {
    await access(source.resolvedLocalPath, constants.R_OK);
    return { localPath: source.resolvedLocalPath };
  }

  if (!source.remoteCloneUrl || !source.tempCheckoutPath) {
    throw new Error("Remote source metadata is incomplete.");
  }

  await ensureGitInstalled();

  await rm(source.tempCheckoutPath, { recursive: true, force: true });
  await mkdir(path.dirname(source.tempCheckoutPath), { recursive: true });

  try {
    await execa("git", ["clone", "--depth", "1", source.remoteCloneUrl, source.tempCheckoutPath]);
  } catch (error) {
    logErrorToStdout(
      error,
      `Failed to clone remote source "${source.originalSourceArg}" into ${source.tempCheckoutPath}:`,
    );
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to clone remote source "${source.originalSourceArg}": ${message}`);
  }

  return { localPath: source.tempCheckoutPath };
}
