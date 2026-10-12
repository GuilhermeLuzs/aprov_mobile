import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, icon as iconToken, radius, size, space, type } from '../theme';
import { pageItems } from '../utils/pagination';

type Props = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
};

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

      {pageItems(page, pageCount).map((item, i) => {
        if (item === 'gap') {
          return (
            <Text key={`gap-${i}`} style={styles.gap} accessibilityElementsHidden>
              …
            </Text>
          );
        }
        const active = item === page;
        return (
          <Pressable
            key={item}
            onPress={() => go(item)}
            hitSlop={space.xs}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={active ? `Página ${item}, atual` : `Ir para a página ${item}`}
            style={({ pressed }) => [
              styles.number,
              active && styles.numberOn,
              pressed && !active && styles.numberPressed,
            ]}
          >
            <Text style={[styles.numberText, active && styles.numberTextOn]}>{item}</Text>
          </Pressable>
        );
      })}

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
      hitSlop={space.xs}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.number, pressed && !disabled && styles.numberPressed]}
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
    gap: space.xs,
  },
  number: {
    width: size.pageButton,
    height: size.pageButton,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  numberOn: { backgroundColor: colors.primary },
  numberPressed: { backgroundColor: colors.surfaceAlt },
  numberText: {
    fontFamily: type.numeric.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.ink,
  },
  numberTextOn: { color: colors.surface },
  gap: {
    width: size.pageButton,
    textAlign: 'center',
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
});
