import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, type } from '../theme';
import type { Company, Coupon, CouponRedemption } from '../types';
import { formatRelativeTime } from '../utils/date';
import { BottomSheet } from './BottomSheet';

type Props = {
  redemptions: CouponRedemption[];
  couponOf: (couponId: string) => Coupon | undefined;
  companyOf: (companyId: string) => Company | undefined;
  onClose: () => void;
};

export function RedemptionsSheet({ redemptions, couponOf, companyOf, onClose }: Props) {
  return (
    <BottomSheet visible title="Meus cupons" closeLabel="Fechar" onClose={onClose}>
      <ScrollView contentContainerStyle={styles.content}>
        {redemptions.length === 0 ? (
          <Text style={styles.empty}>Nenhum cupom resgatado ainda.</Text>
        ) : (
          redemptions.map((redemption) => {
            const coupon = couponOf(redemption.couponId);
            const company = coupon ? companyOf(coupon.companyId) : undefined;
            return (
              <View key={redemption.id} style={styles.row}>
                <Text style={styles.title} numberOfLines={1}>
                  {coupon?.title}
                </Text>
                <Text style={styles.caption} numberOfLines={1}>
                  {company?.name} · resgatado {formatRelativeTime(redemption.redeemedAt)}
                </Text>
                <Text style={styles.code} selectable>
                  {redemption.code}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.sm },
  empty: {
    textAlign: 'center',
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
  row: {
    padding: space.md,
    gap: space.xs,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.ink,
  },
  caption: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  code: {
    fontFamily: type.numeric.family,
    fontSize: type.numeric.size,
    lineHeight: type.numeric.lineHeight,
    color: colors.primary,
  },
});
