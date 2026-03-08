export type PanelVariant = "primary" | "secondary";

export interface AppThemeColors {
  shell: string;
  panel: string;
  panelMuted: string;
  panelHelp: string;
  panelRight: string;
  panelRightMuted: string;
  panelRightHelp: string;
  accent: string;
  accentSoft: string;
  text: string;
  muted: string;
  footerText: string;
  footerAccent: string;
  footerSeparator: string;
  group: string;
  skill: string;
  success: string;
  warning: string;
  danger: string;
  selectionGroup: string;
  selectionSkill: string;
  selectionError: string;
}

export interface PanelVariantTheme {
  surface: string;
  header: string;
}

export interface AppTheme {
  colors: AppThemeColors;
  panelVariants: Record<PanelVariant, PanelVariantTheme>;
}

export const defaultTheme: AppTheme = {
  colors: {
    shell: "#171925",
    panel: "#20263d",
    panelMuted: "#101422",
    panelHelp: "#171c2d",
    panelRight: "#141a29",
    panelRightMuted: "#090d16",
    panelRightHelp: "#0f1422",
    accent: "#f3d38b",
    accentSoft: "#6c7086",
    text: "#c7cee5",
    muted: "#8890ad",
    footerText: "#8890ad",
    footerAccent: "#f3d38b",
    footerSeparator: "#6c7086",
    group: "#89adcb",
    skill: "#b8d0b0",
    success: "#a6da95",
    warning: "#f2cdcd",
    danger: "#ed8796",
    selectionGroup: "#30465c",
    selectionSkill: "#314337",
    selectionError: "#4b2932",
  },
  panelVariants: {
    primary: {
      header: "#20263d",
      surface: "#171c2d",
    },
    secondary: {
      header: "#141a29",
      surface: "#0f1422",
    },
  },
};
