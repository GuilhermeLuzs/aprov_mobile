import { StyleSheet, Text, View } from 'react-native';
import { colors, size, space, type } from '../theme';
import { BrandMark } from './BrandMark';

export function BrandLockup() {
  return (
    <View style={styles.lockup}>
      <BrandMark height={size.welcome.mark} onBrand />
      <Text style={styles.name} accessibilityRole="header">
        APROV
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lockup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm },
  name: {
    fontFamily: type.display.family,
    fontSize: type.display.size,
    lineHeight: type.display.lineHeight,
    color: colors.surface,
  },
});
