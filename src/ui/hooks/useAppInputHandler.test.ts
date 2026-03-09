import { describe, expect, it, vi } from "vitest";

import type { Key } from "ink";

import { handleTreeNavigationInput } from "./useAppInputHandler.js";

function createKey(overrides: Partial<Key>): Key {
  return {
    upArrow: false,
    downArrow: false,
    leftArrow: false,
    rightArrow: false,
    pageDown: false,
    pageUp: false,
    home: false,
    end: false,
    return: false,
    escape: false,
    ctrl: false,
    shift: false,
    tab: false,
    backspace: false,
    delete: false,
    meta: false,
    super: false,
    hyper: false,
    capsLock: false,
    numLock: false,
    ...overrides,
  };
}

function createActions(pageJumpSize = 5) {
  return {
    moveCursor: vi.fn(),
    pageJumpSize,
    confirmInstall: vi.fn(),
    toggleAtCursor: vi.fn(),
    collapseAtCursor: vi.fn(),
    expandAtCursor: vi.fn(),
  };
}

describe("handleTreeNavigationInput", () => {
  it("moves up and down one row with arrow keys", () => {
    const actions = createActions();

    expect(handleTreeNavigationInput("", createKey({ upArrow: true }), actions)).toBe(true);
    expect(handleTreeNavigationInput("", createKey({ downArrow: true }), actions)).toBe(true);

    expect(actions.moveCursor).toHaveBeenNthCalledWith(1, -1);
    expect(actions.moveCursor).toHaveBeenNthCalledWith(2, 1);
  });

  it("jumps by a page with PageUp and PageDown", () => {
    const actions = createActions(7);

    expect(handleTreeNavigationInput("", createKey({ pageUp: true }), actions)).toBe(true);
    expect(handleTreeNavigationInput("", createKey({ pageDown: true }), actions)).toBe(true);

    expect(actions.moveCursor).toHaveBeenNthCalledWith(1, -7);
    expect(actions.moveCursor).toHaveBeenNthCalledWith(2, 7);
  });
});
