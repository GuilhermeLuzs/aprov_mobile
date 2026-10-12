import { Pressable, StyleSheet, View } from 'react-native';
import { Bookmark, Receipt, type LucideIcon } from 'lucide-react-native';
import { colors, icon, radius, space } from '../theme';
import type { ProductKind } from '../types';

type Props = {
  kind: ProductKind;
  saved: boolean;
  purchased: boolean;
  onToggleSaved?: () => void;
  onTogglePurchased?: () => void;
};

export function ItemToggles({ kind, saved, purchased, onToggleSaved, onTogglePurchased }: Props) {
  const purchaseVerb = kind === 'service' ? 'contratei' : 'comprei';

  return (
    <View style={styles.toggles}>
      <ToggleIcon
        Icon={Receipt}
        active={purchased}
        label={purchased ? `Desmarcar ${purchaseVerb}` : `Marcar como ${purchaseVerb}`}
        onPress={onTogglePurchased}
      />
      <ToggleIcon
        Icon={Bookmark}
        active={saved}
        fillWhenActive
        label={saved ? 'Remover dos salvos' : 'Salvar'}
        onPress={onToggleSaved}
      />
    </View>
  );
}

function ToggleIcon({
  Icon,
  active,
  fillWhenActive = false,
  label,
  onPress,
}: {
  Icon: LucideIcon;
  active: boolean;
  fillWhenActive?: boolean;
  label: string;
  onPress?: () => void;
}) {
  const tint = active ? colors.primary : colors.ink;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      hitSlop={space.xs}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={[styles.toggle, active && styles.toggleActive]}
    >
      <Icon
        color={tint}
        fill={active && fillWhenActive ? tint : 'transparent'}
        size={icon.size.md}
        strokeWidth={icon.strokeWidth}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggles: {
    position: 'absolute',
    top: space.sm,
    right: space.sm,
    flexDirection: 'row',
    gap: space.sm,
  },
  toggle: {
    width: icon.button,
    height: icon.button,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  toggleActive: {
    backgroundColor: colors.primaryDim,
  },
});
