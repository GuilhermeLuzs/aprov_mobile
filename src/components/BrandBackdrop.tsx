import { useId, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { size, welcomeGradient, welcomeTextureOpacity } from '../theme';
import { BrandMark } from './BrandMark';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  textured?: boolean;
};

const lastStop = welcomeGradient.length - 1;

const { sm, md, lg } = size.welcome.textureStar;

const TEXTURE = [
  { height: lg, top: '-4%', left: '-18%', rotate: '-14deg' },
  { height: sm, top: '12%', left: '78%', rotate: '18deg' },
  { height: md, top: '30%', left: '62%', rotate: '-8deg' },
  { height: sm, top: '44%', left: '6%', rotate: '24deg' },
  { height: lg, top: '60%', left: '58%', rotate: '10deg' },
  { height: md, top: '78%', left: '-10%', rotate: '-20deg' },
] as const;

export function BrandBackdrop({ children, style, textured = true }: Props) {
  const gradientId = `backdrop${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <View style={[styles.backdrop, style]}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0.4" y2="1">
            {welcomeGradient.map((color, index) => (
              <Stop key={color} offset={index / lastStop} stopColor={color} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
      {textured ? (
        <View
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {TEXTURE.map((star) => (
            <View
              key={`${star.top}${star.left}`}
              style={[
                styles.textureStar,
                { top: star.top, left: star.left, transform: [{ rotate: star.rotate }] },
              ]}
            >
              <BrandMark height={star.height} onBrand />
            </View>
          ))}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { overflow: 'hidden' },
  textureStar: { position: 'absolute', opacity: welcomeTextureOpacity },
});
