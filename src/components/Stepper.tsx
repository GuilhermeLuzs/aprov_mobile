import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, type } from '../theme';

type Props = {
  current: number;
  total: number;
  showLabel?: boolean;
  complete?: boolean;
};

export function Stepper({ current, total, showLabel = true, complete = false }: Props) {
  const clamped = Math.max(1, Math.min(current, total));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: clamped }}
    >
      <View style={styles.track}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              i < clamped
                ? complete
                  ? styles.segmentComplete
                  : styles.segmentOn
                : styles.segmentOff,
            ]}
          />
        ))}
      </View>
      {showLabel ? (
        <Text style={styles.label}>{`Passo ${clamped} de ${total}`}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: space.xs,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: radius.pill,
  },
  segmentOn: { backgroundColor: colors.primary },
  segmentComplete: { backgroundColor: colors.agree },
  segmentOff: { backgroundColor: colors.surfaceAlt },
  label: {
    marginTop: space.sm,
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
});
