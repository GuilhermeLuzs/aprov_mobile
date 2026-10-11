import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { colors, icon, radius, size, space, type } from '../theme';

type Props = {
  Icon: LucideIcon;
  label: string;
  detail?: string;
  destructive?: boolean;
  onPress: () => void;
};

export function MenuRow({ Icon, label, detail, destructive = false, onPress }: Props) {
  const tint = destructive ? colors.disagree : colors.ink;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={detail ? `${label}, ${detail}` : label}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Icon size={icon.size.lg} color={tint} strokeWidth={icon.strokeWidth} />
      <View style={styles.text}>
        <Text style={[styles.label, { color: tint }]}>{label}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
      <ChevronRight size={icon.size.md} color={colors.inkFaint} strokeWidth={icon.strokeWidth} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: size.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    borderRadius: radius.control,
  },
  rowPressed: { backgroundColor: colors.surfaceAlt },
  text: { flex: 1 },
  label: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
  },
  detail: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
});
