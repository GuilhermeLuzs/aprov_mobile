import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, type } from '../theme';
import type { Company, Coupon, CouponRedemption } from '../types';
import { formatDayMonth } from '../utils/date';
import { formatInt } from '../utils/format';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { RewardAmount } from './RewardAmount';

type Props = {
  coupon: Coupon;
  company: Company;
  balance: number;
  onClose: () => void;
  onRedeem: () => CouponRedemption | null;
};

export function CouponSheet({ coupon, company, balance, onClose, onRedeem }: Props) {
  const [redemption, setRedemption] = useState<CouponRedemption | null>(null);
  const missing = coupon.coinCost - balance;

  const redeem = () => setRedemption(onRedeem());

  if (redemption) {
    return (
      <BottomSheet
        visible
        title="Cupom resgatado"
        closeLabel="Fechar"
        onClose={onClose}
        footer={<Button label="Pronto" onPress={onClose} style={styles.footerButton} />}
      >
        <View style={styles.content}>
          <Text style={styles.caption} numberOfLines={1}>
            {company.name}
          </Text>
          <Text style={styles.caption}>Seu código</Text>
          <View style={styles.codeBox}>
            <Text style={styles.code} selectable>
              {redemption.code}
            </Text>
          </View>
          <Text style={styles.description}>
            Use este código na hora da compra. Ele fica guardado em Meus cupons.
          </Text>
        </View>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      visible
      title={coupon.title}
      closeLabel="Fechar"
      onClose={onClose}
      footer={
        <Button
          label={missing > 0 ? `Faltam ${formatInt(missing)} ${company.coinName}` : 'Resgatar'}
          disabled={missing > 0}
          onPress={redeem}
          style={styles.footerButton}
        />
      }
    >
      <View style={styles.content}>
        <Text style={styles.caption} numberOfLines={1}>
          {company.name}
        </Text>
        <Text style={styles.description}>{coupon.description}</Text>
        <Text style={styles.caption}>Válido até {formatDayMonth(coupon.validUntil)}</Text>
        <RewardAmount
          amount={coupon.coinCost}
          label={company.coinName}
          coin={{ icon: company.coinIcon, color: company.coinColor }}
        />
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
  caption: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  description: {
    textAlign: 'center',
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
  codeBox: {
    paddingVertical: space.md,
    paddingHorizontal: space.xl,
    borderRadius: radius.control,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.primaryDim,
  },
  code: {
    fontFamily: type.title.family,
    fontSize: type.title.size,
    lineHeight: type.title.lineHeight,
    color: colors.ink,
  },
  footerButton: { flex: 1 },
});
