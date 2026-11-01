import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, size, space, type } from '../theme';
import type { Company, Coupon } from '../types';
import { formatDayMonth } from '../utils/date';
import { formatInt } from '../utils/format';
import { Button } from './Button';
import { RewardAmount } from './RewardAmount';

type Props = {
  coupon: Coupon;
  company: Company;
  balance: number;
  onPress: () => void;
  fullWidth?: boolean;
};

export function CouponCard({ coupon, company, balance, onPress, fullWidth = false }: Props) {
  const missing = coupon.coinCost - balance;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={coupon.title}
      style={({ pressed }) => [styles.card, fullWidth && styles.fullWidth, pressed && styles.pressed]}
    >
      <Text style={styles.title} numberOfLines={1}>
        {coupon.title}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {coupon.description}
      </Text>
      <View style={styles.meta}>
        <RewardAmount
          amount={coupon.coinCost}
          coin={{ icon: company.coinIcon, color: company.coinColor }}
          size="sm"
        />
        <Text style={styles.validity}>Até {formatDayMonth(coupon.validUntil)}</Text>
      </View>
      <Button
        label={missing > 0 ? `Faltam ${formatInt(missing)}` : 'Resgatar'}
        size="sm"
        disabled={missing > 0}
        onPress={onPress}
        fullWidth
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: size.couponCard,
    padding: space.md,
    gap: space.sm,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  fullWidth: { width: 'auto', alignSelf: 'stretch' },
  pressed: { backgroundColor: colors.surfaceAlt },
  title: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.ink,
  },
  description: {
    minHeight: type.caption.lineHeight * 2,
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  validity: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
});
