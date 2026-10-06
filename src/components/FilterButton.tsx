import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';
import { colors, icon, radius, size, type } from '../theme';

type Props = {
  activeCount: number;
  onPress: () => void;
  accessibilityLabel: string;
};

export function FilterButton({ activeCount, onPress, accessibilityLabel }: Props) {
  const active = activeCount > 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        active ? `${accessibilityLabel}, ${activeCount} selecionadas` : accessibilityLabel
      }
      style={({ pressed }) => [
        styles.button,
        active && styles.buttonActive,
        pressed && styles.pressed,
      ]}
    >
      <SlidersHorizontal
        size={icon.size.md}
        color={active ? colors.primary : colors.ink}
        strokeWidth={icon.strokeWidth}
      />
      {active ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{activeCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: size.control,
    height: size.control,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  buttonActive: { backgroundColor: colors.primaryDim },
  pressed: { opacity: 0.7 },
  badge: {
    position: 'absolute',
    top: -size.badge / 3,
    right: -size.badge / 3,
    minWidth: size.badge,
    height: size.badge,
    paddingHorizontal: size.badge / 4,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  badgeText: {
    fontFamily: type.micro.family,
    fontSize: type.micro.size,
    lineHeight: type.micro.lineHeight,
    color: colors.surface,
  },
});
