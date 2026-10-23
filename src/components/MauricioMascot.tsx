import { Image, type ImageSourcePropType, type StyleProp, type ImageStyle } from 'react-native';

export type MauricioMood = 'neutral' | 'talking' | 'starry' | 'angry' | 'serious' | 'confused' | 'sad';

const ART: Record<MauricioMood, ImageSourcePropType> = {
  neutral: require('../../assets/mauricios/icon-mauricio.png'),
  talking: require('../../assets/mauricios/icon-mau-fala.png'),
  starry: require('../../assets/mauricios/icon-mau-estrela.png'),
  angry: require('../../assets/mauricios/icon-mau-mau.png'),
  serious: require('../../assets/mauricios/icon-mau-serio.png'),
  confused: require('../../assets/mauricios/icon-mau-confuso.png'),
  sad: require('../../assets/mauricios/icon-mau-triste.png'),
};

const ART_WIDTH_PER_HEIGHT = 827 / 768;

type Props = {
  size?: number;
  mood?: MauricioMood;
  style?: StyleProp<ImageStyle>;
};

export function MauricioMascot({ size = 96, mood = 'neutral', style }: Props) {
  return (
    <Image
      source={ART[mood]}
      style={[{ width: size * ART_WIDTH_PER_HEIGHT, height: size }, style]}
      resizeMode="contain"
      accessible
      accessibilityRole="image"
      accessibilityLabel="Maurício"
    />
  );
}
