import { StyleSheet, Text, View } from 'react-native';
import { Coins, type LucideIcon } from 'lucide-react-native';
import { colors, icon as iconToken, space, type } from '../theme';
import { formatInt } from '../utils/format';

type Props = {
  amount: number;
  label: string;
  icon?: LucideIcon;
  size?: 'sm' | 'md';
  tone?: 'onLight' | 'onBrand';
};

export function RewardAmount({
  amount,
  label,
  icon: Icon = Coins,
  size = 'md',
  tone = 'onLight',
}: Props) {
  const px = size === 'sm' ? iconToken.size.sm : iconToken.size.md;
  const color = tone === 'onBrand' ? colors.surface : colors.valueDeep;
  const text = `${formatInt(amount)} ${label}`;

  return (
    <View style={styles.row} accessible accessibilityLabel={text}>
      <Icon size={px} color={color} strokeWidth={iconToken.strokeWidth} />
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
