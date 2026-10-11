import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Check } from 'lucide-react-native';
import { colors, radius, size, space } from '../theme';

const RADIO_STROKE = 2;
const RADIO_GAP = 4;

function RadioMark({ selected }: { selected: boolean }) {
  const center = size.checkbox / 2;
  const color = selected ? colors.primary : colors.inkFaint;
  return (
    <Svg width={size.checkbox} height={size.checkbox}>
      <Circle
        cx={center}
        cy={center}
        r={center - RADIO_STROKE / 2}
        stroke={color}
        strokeWidth={RADIO_STROKE}
        fill="none"
      />
      {selected ? (
        <Circle cx={center} cy={center} r={center - RADIO_STROKE - RADIO_GAP} fill={color} />
      ) : null}
    </Svg>
  );
}

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
  const indicator =
    mode === 'radio' ? (
      <RadioMark selected={selected} />
    ) : (
      <View style={[styles.indicatorBase, selected ? styles.checkOn : styles.indicatorOff]}>
        {selected ? <Check size={14} color={colors.surface} strokeWidth={3} /> : null}
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
    width: size.checkbox,
    height: size.checkbox,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorOff: { borderWidth: 2, borderColor: colors.inkFaint },
  checkOn: { backgroundColor: colors.primary },
});
