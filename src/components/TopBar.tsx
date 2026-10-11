import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { colors, icon, size, space } from '../theme';

type Props = {
  children: ReactNode;
  onBack?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function TopBar({ children, onBack, style }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + space.sm }, style]}>
      {onBack ? (
        <View style={styles.backRow}>
          <Pressable
            onPress={onBack}
            hitSlop={space.sm}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            style={styles.back}
          >
            <ArrowLeft size={icon.size.lg} color={colors.ink} strokeWidth={icon.strokeWidth} />
          </Pressable>
          <View style={styles.backContent}>{children}</View>
        </View>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: space.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingBottom: space.sm,
  },
  back: {
    height: size.control,
    justifyContent: 'center',
  },
  backContent: { flex: 1 },
});
