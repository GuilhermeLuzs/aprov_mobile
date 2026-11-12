import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, icon, radius, size, space, type } from '../theme';

type Props = {
  label: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
};

export function VersionPager({ label, canGoBack, canGoForward, onBack, onForward }: Props) {
  return (
    <View style={styles.bar}>
      <Pressable
        onPress={onBack}
        disabled={!canGoBack}
        hitSlop={space.xs}
        accessibilityRole="button"
        accessibilityLabel="Versão anterior"
        accessibilityState={{ disabled: !canGoBack }}
        style={styles.arrow}
      >
        <ChevronLeft
          size={icon.size.md}
          color={canGoBack ? colors.ink : colors.inkFaint}
          strokeWidth={icon.strokeWidth}
        />
      </Pressable>
      <Text style={styles.label} numberOfLines={1} accessibilityLiveRegion="polite">
        {label}
      </Text>
      <Pressable
        onPress={onForward}
        disabled={!canGoForward}
        hitSlop={space.xs}
        accessibilityRole="button"
        accessibilityLabel="Próxima versão"
        accessibilityState={{ disabled: !canGoForward }}
        style={styles.arrow}
      >
        <ChevronRight
          size={icon.size.md}
          color={canGoForward ? colors.ink : colors.inkFaint}
          strokeWidth={icon.strokeWidth}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  arrow: {
    width: size.control,
    height: size.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.ink,
  },
});
