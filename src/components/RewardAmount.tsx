import { StyleSheet, Text, View } from 'react-native';
import { Coins, type LucideIcon } from 'lucide-react-native';
import { colors, icon as iconToken, space, type } from '../theme';
import type { CoinIcon } from '../types';
import { formatInt } from '../utils/format';
import { CoinBadge } from './CoinBadge';

type Props = {
  amount: number;
  label?: string;
  icon?: LucideIcon;
  size?: 'sm' | 'md';
  tone?: 'onLight' | 'onBrand';
  coin?: { icon: CoinIcon; color: string };
};

export function RewardAmount({
  amount,
  label,
  icon: Icon = Coins,
  size = 'md',
  tone = 'onLight',
  coin,
}: Props) {
  const px = size === 'sm' ? iconToken.size.sm : iconToken.size.md;
  const lightColor = coin ? coin.color : colors.valueDeep;
  const color = tone === 'onBrand' ? colors.surface : lightColor;
  const text = label ? `${formatInt(amount)} ${label}` : formatInt(amount);

  return (
    <View style={styles.row} accessible accessibilityLabel={text}>
      {coin ? (
        <CoinBadge icon={coin.icon} color={coin.color} size="md" />
      ) : (
        <Icon size={px} color={color} strokeWidth={iconToken.strokeWidth} />
      )}
      <Text style={[styles.text, size === 'sm' ? styles.sm : styles.md, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  text: { fontFamily: type.numeric.family },
  sm: {
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
  },
  md: {
    fontSize: type.numeric.size,
    lineHeight: type.numeric.lineHeight,
  },
});
