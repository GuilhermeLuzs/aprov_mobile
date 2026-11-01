import { Image, type StyleProp, type ImageStyle } from 'react-native';
import { useEquippedSkin } from '../store/accessories';
import type { MauricioSkin } from '../types';
import { mauricioArt, type MauricioMood } from './mauricioArt';

export type { MauricioMood } from './mauricioArt';

const ART_WIDTH_PER_HEIGHT = 827 / 768;

type Props = {
  size?: number;
  mood?: MauricioMood;
  skin?: MauricioSkin;
  style?: StyleProp<ImageStyle>;
};

export function MauricioMascot({ size = 96, mood = 'neutral', skin, style }: Props) {
  const equippedSkin = useEquippedSkin();

  return (
    <Image
      source={mauricioArt(skin ?? equippedSkin, mood)}
      style={[{ width: size * ART_WIDTH_PER_HEIGHT, height: size }, style]}
      resizeMode="contain"
      accessible
      accessibilityRole="image"
      accessibilityLabel="Maurício"
    />
  );
}
