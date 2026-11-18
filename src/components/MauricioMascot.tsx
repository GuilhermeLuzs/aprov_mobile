import { Image, StyleSheet, View, type StyleProp, type ImageStyle } from 'react-native';
import { useEquippedSkin } from '../store/accessories';
import { colors, size as sizeToken } from '../theme';
import type { MauricioSkin } from '../types';
import { mauricioArt, type MauricioMood } from './mauricioArt';

export type { MauricioMood } from './mauricioArt';

const ART_WIDTH_PER_HEIGHT = 827 / 768;
const OUTLINE_DIRECTIONS = 16;

type Props = {
  size?: number;
  mood?: MauricioMood;
  skin?: MauricioSkin;
  outlined?: boolean;
  style?: StyleProp<ImageStyle>;
};

export function MauricioMascot({ size = 96, mood = 'neutral', skin, outlined = false, style }: Props) {
  const equippedSkin = useEquippedSkin();
  const source = mauricioArt(skin ?? equippedSkin, mood);
  const box = { width: size * ART_WIDTH_PER_HEIGHT, height: size };

  const art = (
    <Image
      source={source}
      style={[box, style]}
      resizeMode="contain"
      accessible
      accessibilityRole="image"
      accessibilityLabel="Maurício"
    />
  );

  if (!outlined) return art;

  const stroke = sizeToken.mascotOutline;

  return (
    <View style={box}>
      {Array.from({ length: OUTLINE_DIRECTIONS }, (_, index) => {
        const angle = (index / OUTLINE_DIRECTIONS) * 2 * Math.PI;
        return (
          <Image
            key={index}
            source={source}
            tintColor={colors.surface}
            resizeMode="contain"
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={[
              box,
              styles.outline,
              {
                transform: [
                  { translateX: Math.cos(angle) * stroke },
                  { translateY: Math.sin(angle) * stroke },
                ],
              },
            ]}
          />
        );
      })}
      {art}
    </View>
  );
}

const styles = StyleSheet.create({
  outline: { position: 'absolute', top: 0, left: 0 },
});
