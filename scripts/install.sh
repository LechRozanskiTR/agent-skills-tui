#!/usr/bin/env sh

set -eu

REPO="${AGENT_SKILLS_TUI_REPO:-LechRozanskiTR/agent-skills-tui}"
VERSION="${AGENT_SKILLS_TUI_VERSION:-}"
INSTALL_DIR="${AGENT_SKILLS_TUI_INSTALL_DIR:-$HOME/.local/share/agent-skills-tui}"
BIN_DIR="${AGENT_SKILLS_TUI_BIN_DIR:-$HOME/.local/bin}"
ASSET_NAME="agent-skills-tui.tar.gz"

fail() {
  printf '%s\n' "$1" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Required command not found: $1"
}

need_cmd curl
need_cmd tar
need_cmd node

UNAME_S="$(uname -s)"
case "$UNAME_S" in
  Darwin|Linux)
    ;;
  *)
    fail "Unsupported platform for install.sh: $UNAME_S. Use install.ps1 on Windows."
    ;;
esac

NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
if [ "$NODE_MAJOR" -lt 20 ]; then
  fail "Node.js 20+ is required. Found Node.js $NODE_MAJOR."
fi

if [ -n "$VERSION" ]; then
  DOWNLOAD_URL="https://github.com/$REPO/releases/download/$VERSION/$ASSET_NAME"
else
  DOWNLOAD_URL="https://github.com/$REPO/releases/latest/download/$ASSET_NAME"
fi

TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT INT TERM

ARCHIVE_PATH="$TMP_DIR/$ASSET_NAME"
EXTRACT_DIR="$TMP_DIR/extract"

mkdir -p "$EXTRACT_DIR"

printf 'Downloading %s\n' "$DOWNLOAD_URL"
curl -fsSL "$DOWNLOAD_URL" -o "$ARCHIVE_PATH"
tar -xzf "$ARCHIVE_PATH" -C "$EXTRACT_DIR"

EXTRACTED_APP_DIR="$EXTRACT_DIR/agent-skills-tui"
[ -d "$EXTRACTED_APP_DIR" ] || fail "Release archive did not contain agent-skills-tui/"

mkdir -p "$(dirname "$INSTALL_DIR")" "$BIN_DIR"
rm -rf "$INSTALL_DIR"
mv "$EXTRACTED_APP_DIR" "$INSTALL_DIR"

ln -sfn "$INSTALL_DIR/bin/agent-skills-tui" "$BIN_DIR/agent-skills-tui"

printf 'Installed agent-skills-tui to %s\n' "$INSTALL_DIR"
printf 'Linked executable to %s/agent-skills-tui\n' "$BIN_DIR"

case ":$PATH:" in
  *":$BIN_DIR:"*)
    ;;
  *)
    printf '%s\n' "Add $BIN_DIR to your PATH if it is not already available in new shells."
    ;;
esac
