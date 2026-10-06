import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { colors, icon, radius, size, space, type } from '../theme';

type Props = {
  visible: boolean;
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function BottomSheet({ visible, title, closeLabel, onClose, children, footer }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.scrim}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
        />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + space.md }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              onPress={onClose}
              hitSlop={space.sm}
              accessibilityRole="button"
              accessibilityLabel={closeLabel}
            >
              <X size={icon.size.lg} color={colors.ink} strokeWidth={icon.strokeWidth} />
            </Pressable>
          </View>

          <View style={styles.body}>{children}</View>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: colors.scrim },
  sheet: {
    maxHeight: size.sheetMaxHeight,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    backgroundColor: colors.bg,
  },
  handle: {
    alignSelf: 'center',
    width: size.sheetHandle.width,
    height: size.sheetHandle.height,
    marginTop: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: space.md,
  },
  title: {
    fontFamily: type.title.family,
    fontSize: type.title.size,
    lineHeight: type.title.lineHeight,
    color: colors.ink,
  },
  body: { flexShrink: 1 },
  footer: {
    flexDirection: 'row',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
