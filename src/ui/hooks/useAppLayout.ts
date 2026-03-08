import type { FooterShortcut } from "../constants.js";
import { FOOTER_SHORTCUTS, HELP_SHORTCUT, SIDEBAR_WIDTH } from "../constants.js";
import { footerShortcutWidth } from "../utils/presentation.js";
import { clamp, truncateText } from "../utils/text.js";

interface UseAppLayoutParams {
  stdoutColumns?: number;
  stdoutRows?: number;
  searchMode: boolean;
  query: string;
  status: string;
  activeSourceArg: string;
  cursorIndex: number;
  visibleRowsCount: number;
  visibleRows: { id: string; depth: number }[];
}

interface UseAppLayoutResult {
  stdoutWidth: number;
  stdoutHeight: number;
  mainHeight: number;
  sidebarWidth: number;
  listWindowStart: number;
  visibleListRows: { id: string; depth: number }[];
  showFooterSource: boolean;
  footerSourceText: string;
  footerStatusText: string;
  footerStatusMaxLength: number;
  visibleFooterShortcuts: FooterShortcut[];
}

export function useAppLayout({
  stdoutColumns,
  stdoutRows,
  searchMode,
  query,
  status,
  activeSourceArg,
  cursorIndex,
  visibleRowsCount,
  visibleRows,
}: UseAppLayoutParams): UseAppLayoutResult {
  const stdoutWidth = stdoutColumns ?? 80;
  const stdoutHeight = stdoutRows ?? 24;
  const sidebarWidth = clamp(SIDEBAR_WIDTH, 30, Math.max(30, stdoutWidth - 24));
  const showFooterSource = stdoutWidth >= 120;
  const footerHeight = (searchMode ? 1 : 0) + 1;
  const mainHeight = Math.max(8, stdoutHeight - footerHeight);
  const sidebarChromeHeight = 3;
  const listViewportSize = Math.max(1, mainHeight - sidebarChromeHeight);
  const listWindowStart = clamp(
    cursorIndex - Math.floor(listViewportSize / 2),
    0,
    Math.max(0, visibleRowsCount - listViewportSize),
  );
  const visibleListRows = visibleRows.slice(listWindowStart, listWindowStart + listViewportSize);
  const footerStatusText = query ? `filter: ${query}` : status;
  const footerStatusMaxLength = showFooterSource ? 36 : 28;
  const footerSourceMaxLength = Math.max(24, Math.floor(stdoutWidth / 4));
  const footerSourceText = showFooterSource
    ? truncateText(`Source: ${activeSourceArg}`, footerSourceMaxLength)
    : "";
  const footerRightText = showFooterSource
    ? `${footerSourceText} · ${truncateText(footerStatusText, footerStatusMaxLength)}`
    : truncateText(footerStatusText, footerStatusMaxLength);
  const footerReservedWidth = clamp(
    footerRightText.length + 4,
    24,
    Math.max(24, Math.floor(stdoutWidth * 0.6)),
  );
  const footerLeftAvailableWidth = Math.max(0, stdoutWidth - footerReservedWidth);
  const visibleFooterShortcuts = (() => {
    const selected: FooterShortcut[] = [];
    const mandatoryWidth = footerShortcutWidth(HELP_SHORTCUT);
    let usedWidth = mandatoryWidth;

    for (const shortcut of FOOTER_SHORTCUTS) {
      const nextWidth = usedWidth + 3 + footerShortcutWidth(shortcut);
      if (nextWidth > footerLeftAvailableWidth) {
        break;
      }

      selected.push(shortcut);
      usedWidth = nextWidth;
    }

    return [...selected, HELP_SHORTCUT];
  })();

  return {
    stdoutWidth,
    stdoutHeight,
    mainHeight,
    sidebarWidth,
    listWindowStart,
    visibleListRows,
    showFooterSource,
    footerSourceText,
    footerStatusText,
    footerStatusMaxLength,
    visibleFooterShortcuts,
  };
}
