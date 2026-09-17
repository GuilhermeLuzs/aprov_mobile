import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, icon as iconToken, radius, space, type } from '../theme';

export type ChipVariant = 'neutral' | 'positive' | 'negative';
export type ChipSize = 'sm' | 'md';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: LucideIcon;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

type Skin = { bg: string; border: string; fg: string };

function skin(variant: ChipVariant, active: boolean): Skin {
  if (!active) {
    return { bg: colors.surface, border: colors.border, fg: colors.ink };
  }
  switch (variant) {
    case 'positive':
      return { bg: colors.agreeDim, border: colors.agree, fg: colors.agree };
    case 'negative':
      return { bg: colors.disagreeDim, border: colors.disagree, fg: colors.disagree };
    default:
      return { bg: colors.primaryDim, border: colors.primary, fg: colors.primary };
  }
}

export function Chip({
  label,
  selected = false,
  onPress,
  variant = 'neutral',
  size = 'md',
  icon: Icon,
  accessibilityLabel,
  style,
}: Props) {
  const active = selected || (!onPress && variant !== 'neutral');
  const s = skin(variant, active);
  const sm = size === 'sm';

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected } : undefined}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.base,
        sm ? styles.sm : styles.md,
        { backgroundColor: s.bg, borderColor: s.border },
        pressed && onPress ? styles.pressed : null,
        style,
      ]}
    >
      {Icon ? (
        <Icon
          size={sm ? 14 : iconToken.size.sm}
          color={s.fg}
          strokeWidth={iconToken.strokeWidth}
        />
      ) : null}
      <Text style={[sm ? styles.labelSm : styles.labelMd, { color: s.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  md: {
    minHeight: 44,
    gap: space.xs,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  sm: {
    minHeight: 28,
    gap: space.xs,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  pressed: { opacity: 0.7 },
  labelMd: {
    flexShrink: 1,
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
  },
  labelSm: {
    flexShrink: 1,
    fontFamily: type.micro.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
  },
});
