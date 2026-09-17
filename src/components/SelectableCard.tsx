import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, icon as iconToken, radius, space } from '../theme';

type Props = {
  children: ReactNode;
  onPress: () => void;
  selected?: boolean;
  mode?: 'check' | 'radio';
  indicatorPosition?: 'leading' | 'trailing';
  accessibilityLabel: string;
};

export function SelectableCard({
  children,
  onPress,
  selected = false,
  mode = 'check',
  indicatorPosition = 'trailing',
  accessibilityLabel,
}: Props) {
  const indicator = (
    <View
      style={[
        styles.indicatorBase,
        mode === 'radio' ? styles.radio : styles.check,
        selected
          ? mode === 'radio'
            ? styles.radioOn
            : styles.checkOn
          : styles.indicatorOff,
      ]}
    >
      {mode === 'radio' && selected ? <View style={styles.radioDot} /> : null}
      {mode === 'check' && selected ? (
        <Check size={14} color={colors.surface} strokeWidth={3} />
      ) : null}
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={mode === 'radio' ? 'radio' : 'checkbox'}
      accessibilityState={{ checked: selected, selected }}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.card,
        selected ? styles.cardOn : styles.cardOff,
        pressed ? styles.pressed : null,
      ]}
    >
      {indicatorPosition === 'leading' ? indicator : null}
      <View style={styles.body}>{children}</View>
      {indicatorPosition === 'trailing' ? indicator : null}
    </Pressable>
  );
}

const INDICATOR = 22;

const styles = StyleSheet.create({
  card: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  cardOff: { borderColor: colors.border },
  cardOn: { borderColor: colors.primary },
  pressed: { backgroundColor: colors.surfaceAlt },
  body: { flex: 1 },
  indicatorBase: {
    width: INDICATOR,
    height: INDICATOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { borderRadius: radius.control },
  radio: { borderRadius: radius.pill },
  indicatorOff: { borderWidth: 2, borderColor: colors.inkFaint },
  checkOn: { backgroundColor: colors.primary },
  radioOn: { borderWidth: 2, borderColor: colors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
});
