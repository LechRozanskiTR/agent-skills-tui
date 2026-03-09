import util from "node:util";

let bufferedLines: string[] | null = null;

function stringifyChunk(value: unknown): string {
  if (value instanceof Error) {
    return value.stack ?? value.message;
  }

  if (typeof value === "string") {
    return value;
  }

  return util.inspect(value, { depth: 6, colors: false, breakLength: 120 });
}

function normalizeOutput(value: unknown): string[] {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\r?\n/u)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);
}

export function writeStdoutLine(message: string): void {
  if (bufferedLines) {
    bufferedLines.push(message);
    return;
  }

  process.stdout.write(`${message}\n`);
}

export function beginBufferedStdoutLogs(): void {
  if (!bufferedLines) {
    bufferedLines = [];
  }
}

export function flushBufferedStdoutLogs(): void {
  if (!bufferedLines || bufferedLines.length === 0) {
    bufferedLines = null;
    return;
  }

  const lines = bufferedLines;
  bufferedLines = null;

  for (const line of lines) {
    process.stdout.write(`${line}\n`);
  }
}

export function discardBufferedStdoutLogs(): void {
  bufferedLines = null;
}

export function logToStdout(...values: unknown[]): void {
  const message = values.map((value) => stringifyChunk(value)).join(" ");
  writeStdoutLine(message);
}

interface LogErrorOptions {
  context?: string;
  includeStack?: boolean;
}

export function logErrorToStdout(error: unknown, options: LogErrorOptions | string = {}): void {
  const normalizedOptions: LogErrorOptions =
    typeof options === "string" ? { context: options } : options;
  const { context, includeStack = true } = normalizedOptions;

  if (context) {
    writeStdoutLine(context);
  }

  if (error instanceof Error) {
    writeStdoutLine(includeStack ? (error.stack ?? error.message) : error.message);

    const execaError = error as Error & {
      stdout?: unknown;
      stderr?: unknown;
      all?: unknown;
    };

    for (const line of normalizeOutput(execaError.all)) {
      writeStdoutLine(line);
    }

    if (typeof execaError.all !== "string") {
      for (const line of normalizeOutput(execaError.stdout)) {
        writeStdoutLine(line);
      }

      for (const line of normalizeOutput(execaError.stderr)) {
        writeStdoutLine(line);
      }
    }

    return;
  }

  logToStdout(error);
}
