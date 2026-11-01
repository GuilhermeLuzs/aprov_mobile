import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Award } from 'lucide-react-native';
import type { AccessoryStatus } from '../store/accessories';
import { colors, space, type } from '../theme';
import type { Accessory, User } from '../types';
import { formatInt } from '../utils/format';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { AccessoryPreview } from './AccessoryPreview';
import { MAURICIO_MOODS } from './mauricioArt';
import { RewardAmount } from './RewardAmount';

type Props = {
  accessory: Accessory;
  status: AccessoryStatus;
  user: User;
  onClose: () => void;
  onBuy: () => void;
  onEquip: () => void;
};

type Action = { label: string; onPress?: () => void };

function actionFor(status: AccessoryStatus, onBuy: () => void, onEquip: () => void): Action {
  switch (status.kind) {
    case 'equipped':
      return { label: 'Em uso' };
    case 'owned':
      return { label: 'Equipar', onPress: onEquip };
    case 'buyable':
      return { label: 'Comprar', onPress: onBuy };
    case 'short':
      return { label: `Faltam ${formatInt(status.missing)} pontos` };
    case 'locked':
      return { label: `Libera no nível ${status.level}` };
  }
}

export function AccessorySheet({ accessory, status, user, onClose, onBuy, onEquip }: Props) {
  const [moodIndex, setMoodIndex] = useState(0);
  const action = actionFor(status, onBuy, onEquip);
  const isSkin = accessory.kind === 'skin';

  const nextMood = () => setMoodIndex((i) => (i + 1) % MAURICIO_MOODS.length);

  return (
    <BottomSheet
      visible
      title={accessory.name}
      closeLabel="Fechar"
      onClose={onClose}
      footer={
        <Button
          label={action.label}
          disabled={!action.onPress}
          onPress={action.onPress ?? onClose}
          fullWidth
          style={styles.footerButton}
        />
      }
    >
      <View style={styles.content}>
        <Pressable
          onPress={isSkin ? nextMood : undefined}
          disabled={!isSkin}
          accessibilityRole={isSkin ? 'button' : undefined}
          accessibilityLabel={isSkin ? 'Ver outro humor do Maurício' : undefined}
        >
          <AccessoryPreview
            accessory={accessory}
            user={user}
            variant="sheet"
            mood={MAURICIO_MOODS[moodIndex]}
          />
        </Pressable>
        {isSkin ? <Text style={styles.hint}>Toque no Maurício para ver outros humores.</Text> : null}
        <Text style={styles.description}>{accessory.description}</Text>
        <View style={styles.meta}>
          <Text style={styles.level}>Nível {accessory.level}</Text>
          <RewardAmount amount={accessory.price} label="pontos APROV" icon={Award} />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
  },
  hint: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkFaint,
  },
  description: {
    textAlign: 'center',
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  level: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.inkMuted,
  },
  footerButton: { flex: 1 },
});
