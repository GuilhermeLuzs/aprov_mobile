import { Image, StyleSheet } from 'react-native';
import { colors, size } from '../theme';

const LOGO_ASPECT_RATIO = 905 / 719;

type Props = { height?: number; onBrand?: boolean };

export function BrandMark({ height = size.brandMark, onBrand = false }: Props) {
  return (
    <Image
      source={require('../../assets/logo-aprov.png')}
      style={[styles.mark, { width: Math.round(height * LOGO_ASPECT_RATIO), height }]}
      tintColor={onBrand ? colors.surface : undefined}
      resizeMode="contain"
      accessible
      accessibilityRole="image"
      accessibilityLabel="APROV"
    />
  );
}

const styles = StyleSheet.create({
  mark: { flexShrink: 0 },
});
