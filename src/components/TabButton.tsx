import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, size, space, type } from '../theme';

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function TabButton({ label, active, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.tab}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
      <View style={[styles.indicator, active && styles.indicatorActive]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tab: {
    minHeight: size.control,
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: space.xs,
  },
  label: {
    fontFamily: type.subtitle.family,
    fontSize: type.subtitle.size,
    lineHeight: type.subtitle.lineHeight,
    color: colors.inkMuted,
  },
  labelActive: { color: colors.ink },
  indicator: {
    height: size.tabIndicator,
    alignSelf: 'stretch',
  },
  indicatorActive: { backgroundColor: colors.primary },
});
