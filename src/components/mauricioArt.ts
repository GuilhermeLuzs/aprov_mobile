import type { ImageSourcePropType } from 'react-native';
import type { MauricioSkin } from '../types';

export type MauricioMood = 'neutral' | 'talking' | 'starry' | 'angry' | 'serious' | 'confused' | 'sad';

export const MAURICIO_MOODS: MauricioMood[] = [
  'neutral',
  'talking',
  'starry',
  'angry',
  'serious',
  'confused',
  'sad',
];

type SkinArt = { neutral: ImageSourcePropType } & Partial<Record<MauricioMood, ImageSourcePropType>>;

const ART: Record<MauricioSkin, SkinArt> = {
  mauricio: {
    neutral: require('../../assets/mauricios/icon-mauricio.png'),
    talking: require('../../assets/mauricios/icon-mau-fala.png'),
    starry: require('../../assets/mauricios/icon-mau-estrela.png'),
    angry: require('../../assets/mauricios/icon-mau-mau.png'),
    serious: require('../../assets/mauricios/icon-mau-serio.png'),
    confused: require('../../assets/mauricios/icon-mau-confuso.png'),
    sad: require('../../assets/mauricios/icon-mau-triste.png'),
  },
  cow: {
    neutral: require('../../assets/mauricios/icon-cow-mauricio.png'),
    talking: require('../../assets/mauricios/icon-cow-fala.png'),
    starry: require('../../assets/mauricios/icon-cow-estrela.png'),
    angry: require('../../assets/mauricios/icon-cow-mau.png'),
    serious: require('../../assets/mauricios/icon-cow-serio.png'),
    confused: require('../../assets/mauricios/icon-cow-confuso.png'),
    sad: require('../../assets/mauricios/icon-cow-triste.png'),
  },
  dino: {
    neutral: require('../../assets/mauricios/icon-dino-mauricio.png'),
    talking: require('../../assets/mauricios/icon-dino-fala.png'),
    starry: require('../../assets/mauricios/icon-dino-estrela.png'),
    serious: require('../../assets/mauricios/icon-dino-serio.png'),
    confused: require('../../assets/mauricios/icon-dino-confuso.png'),
    sad: require('../../assets/mauricios/icon-dino-triste.png'),
  },
  mar: {
    neutral: require('../../assets/mauricios/icon-mar-mauricio.png'),
    talking: require('../../assets/mauricios/icon-mar-fala.png'),
    starry: require('../../assets/mauricios/icon-mar-estrela.png'),
    angry: require('../../assets/mauricios/icon-mar-mau.png'),
    serious: require('../../assets/mauricios/icon-mar-serio.png'),
    confused: require('../../assets/mauricios/icon-mar-confuso.png'),
    sad: require('../../assets/mauricios/icon-mar-triste.png'),
  },
  monk: {
    neutral: require('../../assets/mauricios/icon-monk-mauricio.png'),
    talking: require('../../assets/mauricios/icon-monk-fala.png'),
    starry: require('../../assets/mauricios/icon-monk-estrela.png'),
    angry: require('../../assets/mauricios/icon-monk-mau.png'),
    confused: require('../../assets/mauricios/icon-monk-confuso.png'),
    sad: require('../../assets/mauricios/icon-monk-triste.png'),
  },
  ninja: {
    neutral: require('../../assets/mauricios/icon-ninja-mauricio.png'),
    talking: require('../../assets/mauricios/icon-ninja-fala.png'),
    starry: require('../../assets/mauricios/icon-ninja-estrela.png'),
    angry: require('../../assets/mauricios/icon-ninja-mau.png'),
    serious: require('../../assets/mauricios/icon-ninja-serio.png'),
    confused: require('../../assets/mauricios/icon-ninja-confuso.png'),
    sad: require('../../assets/mauricios/icon-ninja-triste.png'),
  },
  pedra: {
    neutral: require('../../assets/mauricios/icon-pedra-mauricio.png'),
    talking: require('../../assets/mauricios/icon-pedra-fala.png'),
    starry: require('../../assets/mauricios/icon-pedra-estrela.png'),
    angry: require('../../assets/mauricios/icon-pedra-mau.png'),
    serious: require('../../assets/mauricios/icon-pedra-serio.png'),
    confused: require('../../assets/mauricios/icon-pedra-confuso.png'),
    sad: require('../../assets/mauricios/icon-pedra-triste.png'),
  },
  snow: {
    neutral: require('../../assets/mauricios/icon-snow-mauricio.png'),
    talking: require('../../assets/mauricios/icon-snow-fala.png'),
    starry: require('../../assets/mauricios/icon-snow-estrela.png'),
    serious: require('../../assets/mauricios/icon-snow-serio.png'),
    confused: require('../../assets/mauricios/icon-snow-confuso.png'),
    sad: require('../../assets/mauricios/icon-snow-triste.png'),
  },
  vamp: {
    neutral: require('../../assets/mauricios/icon-vamp-mauricio.png'),
    talking: require('../../assets/mauricios/icon-vamp-fala.png'),
    starry: require('../../assets/mauricios/icon-vamp-estrela.png'),
    angry: require('../../assets/mauricios/icon-vamp-mau.png'),
    serious: require('../../assets/mauricios/icon-vamp-serio.png'),
    confused: require('../../assets/mauricios/icon-vamp-confuso.png'),
    sad: require('../../assets/mauricios/icon-vamp-triste.png'),
  },
};

export function mauricioArt(skin: MauricioSkin, mood: MauricioMood): ImageSourcePropType {
  const art = ART[skin];
  return art[mood] ?? art.neutral;
}
