import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, space, type } from '../theme';

type Props = {
  title: string;
  action?: { label: string; onPress: () => void };
};

export function SectionHeader({ title, action }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {action ? (
        <Pressable
          onPress={action.onPress}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          {({ pressed }) => (
            <Text style={[styles.action, pressed && styles.actionPressed]}>{action.label}</Text>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    marginBottom: space.md,
  },
  title: {
    flex: 1,
    fontFamily: type.subtitle.family,
    fontSize: type.subtitle.size,
    lineHeight: type.subtitle.lineHeight,
    color: colors.ink,
  },
  action: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.primary,
  },
  actionPressed: { opacity: 0.6 },
});
