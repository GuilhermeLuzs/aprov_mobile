import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, icon as iconToken, radius, space, type } from '../theme';

type Props = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
};

const DOTS_LIMIT = 7;

export function Pagination({ page, pageCount, onChange }: Props) {
  if (pageCount <= 1) return null;

  const go = (next: number) => {
    const clamped = Math.max(1, Math.min(next, pageCount));
    if (clamped !== page) onChange(clamped);
  };

  return (
    <View style={styles.row}>
      <Arrow
        Icon={ChevronLeft}
        label="Página anterior"
        disabled={page <= 1}
        onPress={() => go(page - 1)}
      />

      {pageCount <= DOTS_LIMIT ? (
        <View style={styles.dots}>
          {Array.from({ length: pageCount }, (_, i) => {
            const n = i + 1;
            const active = n === page;
            return (
              <Pressable
                key={n}
                hitSlop={12}
                onPress={() => go(n)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Página ${n}`}
              >
                <View style={[styles.dot, active ? styles.dotOn : styles.dotOff]} />
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Text style={styles.label}>{`página ${page} de ${pageCount}`}</Text>
      )}

      <Arrow
        Icon={ChevronRight}
        label="Próxima página"
        disabled={page >= pageCount}
        onPress={() => go(page + 1)}
      />
    </View>
  );
}

type ArrowProps = {
  Icon: typeof ChevronLeft;
  label: string;
  disabled: boolean;
  onPress: () => void;
};

function Arrow({ Icon, label, disabled, onPress }: ArrowProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.arrow, pressed && !disabled && styles.arrowPressed]}
    >
      <Icon
        size={iconToken.size.md}
        color={disabled ? colors.inkFaint : colors.ink}
        strokeWidth={iconToken.strokeWidth}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
  },
  arrow: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.control,
  },
  arrowPressed: { backgroundColor: colors.surfaceAlt },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  dotOn: { backgroundColor: colors.primary },
  dotOff: { backgroundColor: colors.border },
  label: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
});
