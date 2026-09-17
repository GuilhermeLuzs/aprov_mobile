import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, icon as iconToken, radius, space, type } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'text';
export type ButtonTone = 'onLight' | 'onBrand';
export type ButtonSize = 'sm' | 'md';

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  disabled?: boolean;
  icon?: LucideIcon;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

type Palette = { bg: string; border: string; text: string; pressedBg: string };

function palette(variant: ButtonVariant, tone: ButtonTone): Palette {
  if (tone === 'onBrand') {
    switch (variant) {
      case 'primary':
        return { bg: colors.surface, border: 'transparent', text: colors.primary, pressedBg: colors.valueDim };
      case 'secondary':
        return { bg: 'transparent', border: colors.surface, text: colors.surface, pressedBg: colors.primaryPress };
      case 'text':
        return { bg: 'transparent', border: 'transparent', text: colors.surface, pressedBg: 'transparent' };
    }
  }
  switch (variant) {
    case 'primary':
      return { bg: colors.primary, border: 'transparent', text: colors.surface, pressedBg: colors.primaryPress };
    case 'secondary':
      return { bg: colors.surface, border: colors.border, text: colors.ink, pressedBg: colors.surfaceAlt };
    case 'text':
      return { bg: 'transparent', border: 'transparent', text: colors.primary, pressedBg: colors.primaryDim };
  }
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  tone = 'onLight',
  size = 'md',
  disabled = false,
  icon: Icon,
  fullWidth = false,
  accessibilityLabel,
  style,
}: Props) {
  const p = palette(variant, tone);
  const solidOnLight = tone === 'onLight' && variant !== 'text';
  const bg = disabled && solidOnLight ? colors.surfaceAlt : p.bg;
  const borderColor = disabled && variant === 'secondary' && tone === 'onLight' ? colors.border : p.border;
  const textColor = disabled && solidOnLight ? colors.inkFaint : p.text;
  const containerOpacity = disabled && !solidOnLight ? 0.45 : 1;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        { backgroundColor: bg, borderColor, opacity: containerOpacity },
        variant === 'secondary' && styles.bordered,
        fullWidth && styles.fullWidth,
        pressed && !disabled && variant !== 'text' && { backgroundColor: p.pressedBg },
        pressed && !disabled && variant === 'text' && styles.textPressed,
        style,
      ]}
    >
      <View style={styles.content}>
        {Icon ? (
          <Icon size={iconToken.size.md} color={textColor} strokeWidth={iconToken.strokeWidth} />
        ) : null}
        <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: space.lg,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    minHeight: 44,
    paddingHorizontal: space.md,
  },
  bordered: { borderWidth: 1 },
  fullWidth: { alignSelf: 'stretch' },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  label: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
  },
  textPressed: { opacity: 0.6 },
});
