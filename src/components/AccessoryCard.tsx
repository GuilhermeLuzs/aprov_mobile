import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Award, Lock } from 'lucide-react-native';
import type { AccessoryStatus } from '../store/accessories';
import { colors, radius, size, space, type } from '../theme';
import type { Accessory, User } from '../types';
import { formatInt } from '../utils/format';
import { Button, type ButtonVariant } from './Button';
import { AccessoryPreview } from './AccessoryPreview';
import { RewardAmount } from './RewardAmount';

type Props = {
  accessory: Accessory;
  status: AccessoryStatus;
  user: User;
  width?: number;
  onPress: () => void;
  onEquip: () => void;
};

type CardAction = { label: string; variant: ButtonVariant; onPress?: () => void };

function cardAction(status: AccessoryStatus, onOpen: () => void, onEquip: () => void): CardAction {
  switch (status.kind) {
    case 'equipped':
      return { label: 'Em uso', variant: 'secondary' };
    case 'owned':
      return { label: 'Equipar', variant: 'secondary', onPress: onEquip };
    case 'buyable':
      return { label: 'Comprar', variant: 'primary', onPress: onOpen };
    case 'short':
      return { label: `Faltam ${formatInt(status.missing)}`, variant: 'primary' };
    case 'locked':
      return { label: 'Bloqueado', variant: 'primary' };
  }
}

export function AccessoryCard({ accessory, status, user, width = size.shopCard, onPress, onEquip }: Props) {
  const action = cardAction(status, onPress, onEquip);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessory.name}
      style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}
    >
      <AccessoryPreview accessory={accessory} user={user} variant="card" />
      <Text style={styles.name} numberOfLines={2}>
        {accessory.name}
      </Text>
      <View style={styles.meta}>
        <Text style={styles.level}>Nível {accessory.level}</Text>
        <RewardAmount amount={accessory.price} icon={Award} size="sm" />
      </View>
      <Button
        label={action.label}
        variant={action.variant}
        size="sm"
        icon={status.kind === 'locked' ? Lock : undefined}
        disabled={!action.onPress}
        onPress={action.onPress ?? onPress}
        fullWidth
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: space.md,
    gap: space.sm,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: { backgroundColor: colors.surfaceAlt },
  name: {
    minHeight: type.caption.lineHeight * 2,
    fontFamily: type.bodyBold.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.ink,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.xs,
  },
  level: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
});
