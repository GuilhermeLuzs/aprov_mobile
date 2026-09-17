export const type = {
  display: { family: 'Archivo_800ExtraBold', size: 28, lineHeight: 33 },
  title: { family: 'Archivo_700Bold', size: 20, lineHeight: 25 },
  subtitle: { family: 'Archivo_600SemiBold', size: 16, lineHeight: 21 },
  body: { family: 'Figtree_400Regular', size: 15, lineHeight: 23 },
  bodyBold: { family: 'Figtree_600SemiBold', size: 15, lineHeight: 23 },
  caption: { family: 'Figtree_400Regular', size: 13, lineHeight: 18 },
  micro: { family: 'Figtree_500Medium', size: 11, lineHeight: 15 },
  numeric: { family: 'Archivo_700Bold', size: 15, lineHeight: 20 },
} as const;

export const mauricioVoice = {
  family: 'Figtree_400Regular_Italic',
  size: 15,
  lineHeight: 23,
} as const;

export type TypeToken = keyof typeof type;
