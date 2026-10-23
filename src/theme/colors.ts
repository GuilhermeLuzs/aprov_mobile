export const colors = {
  bg: '#F4F4F6',
  surface: '#FFFFFF',
  surfaceAlt: '#EDECEA',

  ink: '#2A211C',
  inkMuted: '#6E635C',
  inkFaint: '#A9A09A',
  border: '#E4E2E0',

  primary: '#E06014',
  primaryBright: '#F0762D',
  primaryDim: '#FCEDE3',
  primaryPress: '#C34F0C',

  value: '#FACE04',
  valueDeep: '#E8840E',
  valueDim: '#FFF6D6',

  agree: '#0E8F6E',
  disagree: '#CC0C5F',
  agreeDim: '#E2F2ED',
  disagreeDim: '#FBE4EE',
  agreeHalo: 'rgba(14, 143, 110, 0.25)',

  scrim: 'rgba(20, 12, 8, 0.55)',
  mediaBackdrop: '#000000',
  mediaControl: 'rgba(0, 0, 0, 0.45)',
} as const;

export const brandGradient = ['#E8840E', '#FACE04', '#CC0C5F'] as const;

export type ColorToken = keyof typeof colors;
