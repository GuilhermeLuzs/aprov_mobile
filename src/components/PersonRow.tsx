import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, icon, radius, size, space, type } from '../theme';
import type { User } from '../types';
import { Avatar } from './Avatar';

type Props = {
  user: User;
  detail?: string;
  onPress: () => void;
};

export function PersonRow({ user, detail, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver perfil de ${user.name}`}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Avatar uri={user.avatarUri} name={user.name} size="md" />
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {user.name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {user.handle} · Nível {user.level}
          {detail ? ` · ${detail}` : ''}
        </Text>
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
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
    borderRadius: radius.control,
  },
  rowPressed: { backgroundColor: colors.surfaceAlt },
  text: { flex: 1 },
  name: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.ink,
  },
  sub: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
});
