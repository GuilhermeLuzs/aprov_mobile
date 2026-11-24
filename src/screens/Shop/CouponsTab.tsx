import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ticket } from 'lucide-react-native';
import {
  CouponCard,
  LoadingState,
  MenuRow,
  Pagination,
  RedemptionsSheet,
  RewardAmount,
  SectionHeader,
} from '../../components';
import type { ShopStackNavigation } from '../../navigation/types';
import { useCouponShelves, useRedemptions } from '../../queries/coupons';
import { coinBalance, useWallet } from '../../queries/wallet';
import { colors, size, space, type } from '../../theme';
import { useCouponSheet } from './useCouponSheet';

const COUPONS_PER_CAROUSEL = 6;

function redeemedLabel(count: number): string {
  if (count === 0) return 'Nenhum resgatado ainda';
  return `${count} ${count === 1 ? 'resgatado' : 'resgatados'}`;
}

export function CouponsTab() {
  const navigation = useNavigation<ShopStackNavigation<'Shop'>>();
  const wallet = useWallet();
  const redemptions = useRedemptions();
  const { openCoupon, sheet } = useCouponSheet();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [page, setPage] = useState(1);
  const shelvesResult = useCouponShelves(page);
  const shelvesQuery = shelvesResult.data;
  const pageCount = shelvesQuery?.pageCount ?? 1;
  const safePage = Math.min(page, pageCount);
  const pagedShelves = (shelvesQuery?.shelves ?? []).map((shelf) => ({ ...shelf, balance: coinBalance(wallet, shelf.company.id) }));

  if (shelvesResult.isPending) return <LoadingState fill />;

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.gutter}>
          <MenuRow
            Icon={Ticket}
            label="Meus cupons"
            detail={redeemedLabel(redemptions.length)}
            onPress={() => setHistoryOpen(true)}
          />
        </View>

        {pagedShelves.map(({ company, balance, offers }) => (
          <View key={company.id}>
            <View style={styles.gutter}>
              <SectionHeader
                title={company.name}
                action={{
                  label: 'Ver mais',
                  onPress: () => navigation.navigate('CompanyCoupons', { companyId: company.id }),
                }}
              />
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Seu saldo</Text>
                <RewardAmount
                  amount={balance}
                  label={company.coinName}
                  coin={{ icon: company.coinIcon, color: company.coinColor }}
                  size="sm"
                />
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
              snapToInterval={size.couponCard + space.md}
              decelerationRate="fast"
            >
              {offers.slice(0, COUPONS_PER_CAROUSEL).map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  company={company}
                  balance={balance}
                  onPress={() => openCoupon(coupon, company)}
                />
              ))}
            </ScrollView>
          </View>
        ))}

        <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
      </ScrollView>

      {sheet}

      {historyOpen ? (
        <RedemptionsSheet redemptions={redemptions} onClose={() => setHistoryOpen(false)} />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: space.lg, gap: space.xl },
  gutter: { paddingHorizontal: space.lg },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: -space.sm,
    marginBottom: space.md,
  },
  balanceLabel: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  carousel: { paddingHorizontal: space.lg, gap: space.md },
});
