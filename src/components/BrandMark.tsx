import { Image, StyleSheet } from 'react-native';
import { size } from '../theme';

const LOGO_ASPECT_RATIO = 905 / 719;

export function BrandMark() {
  return (
    <Image
      source={require('../../assets/logo-aprov.png')}
      style={styles.mark}
      resizeMode="contain"
      accessible
      accessibilityRole="image"
      accessibilityLabel="APROV"
    />
  );
}

const styles = StyleSheet.create({
  mark: {
    width: Math.round(size.brandMark * LOGO_ASPECT_RATIO),
    height: size.brandMark,
    flexShrink: 0,
  },
});
