import { createTheme } from '@rneui/themed';

/**
 * Repo Vault palette — pulled from the product's own identity, not a default.
 * A vault is warm ink, paper, and brass. One accent (brass) used at the key
 * moments only: shelf edges, active stars, primary buttons.
 * No gradients, no glass, no glow. Flat surfaces, real hierarchy.
 */
export const palette = {
  ink: '#16130F', // app background — warm near-black
  surface: '#221E19', // cards
  surface2: '#2C2620', // shelf tiles / raised surface
  board: '#3A2F22', // the shelf edge — a brass-brown board, not a gradient
  cream: '#F2EAD9', // primary text
  muted: '#A89E8A', // secondary text
  faint: '#6E6455', // disabled / placeholder text
  brass: '#C9A227', // THE accent — used sparingly
  brassDark: '#9A7B1C',
  line: '#3A332B', // hairlines between surfaces
  rust: '#B4552D', // real state only: UNRESOLVED repos need attention
  sage: '#8A9B7E', // real state only: LATER badge tint
};

export const radii = {
  tile: 18,
  card: 14,
  chip: 999, // pills only for chips/badges — deliberate, not everywhere
  button: 10,
  input: 10,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const theme = createTheme({
  mode: 'dark',
  lightColors: {
    primary: palette.brass,
    background: palette.ink,
  },
  darkColors: {
    primary: palette.brass,
    background: palette.ink,
  },
});
