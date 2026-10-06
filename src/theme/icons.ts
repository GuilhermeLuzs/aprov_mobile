export const icon = {
  size: { sm: 16, md: 20, lg: 24 },
  button: 36,
  strokeWidth: 2,
} as const;

export type IconSizeToken = keyof typeof icon.size;
