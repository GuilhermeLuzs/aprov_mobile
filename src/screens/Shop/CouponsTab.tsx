import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ticket } from 'lucide-react-native';
import {
  CouponCard,
  MenuRow,
  Pagination,
  RedemptionsSheet,
  RewardAmount,
  SectionHeader,
} from '../../components';
import { couponById, coupons } from '../../mocks';
import { useCompanies } from '../../queries/catalog';
import type { ShopStackNavigation } from '../../navigation/types';
import { useRedemptions } from '../../store/coupons';
import { coinBalance, useWallet } from '../../queries/wallet';
import { colors, size, space, type } from '../../theme';
import { useCouponSheet } from './useCouponSheet';

const COMPANIES_PER_PAGE = 5;
const COUPONS_PER_CAROUSEL = 6;

const couponOf = (couponId: string) => couponById[couponId];

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
  const companies = useCompanies().data ?? [];
  const companyOf = (companyId: string) => companies.find((c) => c.id === companyId);

  const shelves = companies
    .map((company) => ({
      company,
      balance: coinBalance(wallet, company.id),
      offers: coupons.filter((c) => c.companyId === company.id),
    }))
    .filter((shelf) => shelf.offers.length > 0)
    .sort((a, b) => b.balance - a.balance);

  const pageCount = Math.max(1, Math.ceil(shelves.length / COMPANIES_PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const pagedShelves = shelves.slice((safePage - 1) * COMPANIES_PER_PAGE, safePage * COMPANIES_PER_PAGE);

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
                  onPress={() => openCoupon(coupon.id)}
                />
              ))}
            </ScrollView>
          </View>
        ))}

        <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
      </ScrollView>

      {sheet}

      {historyOpen ? (
        <RedemptionsSheet
          redemptions={redemptions}
          couponOf={couponOf}
          companyOf={companyOf}
          onClose={() => setHistoryOpen(false)}
        />
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
