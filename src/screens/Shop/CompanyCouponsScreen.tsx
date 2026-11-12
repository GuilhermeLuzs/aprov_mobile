import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { CouponCard, EmptyState, Pagination, RewardAmount } from '../../components';
import { coupons } from '../../mocks';
import { useCompany } from '../../queries/catalog';
import type { ShopStackParamList } from '../../navigation/types';
import { coinBalance, useWallet } from '../../queries/wallet';
import { colors, space, type } from '../../theme';
import { useCouponSheet } from './useCouponSheet';

const PAGE_SIZE = 10;

export default function CompanyCouponsScreen() {
  const route = useRoute<RouteProp<ShopStackParamList, 'CompanyCoupons'>>();
  const { companyId } = route.params;
  const wallet = useWallet();
  const { openCoupon, sheet } = useCouponSheet();
  const [page, setPage] = useState(1);

  const company = useCompany(companyId).data;
  const offers = coupons.filter((c) => c.companyId === companyId);
  const pageCount = Math.max(1, Math.ceil(offers.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = offers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (!company) {
    return <EmptyState mood="confused" title="Empresa não encontrada" />;
  }

  const balance = coinBalance(wallet, company.id);

  return (
    <View style={styles.screen}>
      <FlatList
        data={paged}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.companyName}>{company.name}</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Seu saldo</Text>
              <RewardAmount
                amount={balance}
                label={company.coinName}
                coin={{ icon: company.coinIcon, color: company.coinColor }}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <CouponCard
            coupon={item}
            company={company}
            balance={balance}
            onPress={() => openCoupon(item.id)}
            fullWidth
          />
        )}
        ListFooterComponent={
          <View style={styles.pagination}>
            <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
          </View>
        }
        ListEmptyComponent={
          <EmptyState compact title="Nenhum cupom ainda" description="Esta empresa ainda não oferece cupons." />
        }
        showsVerticalScrollIndicator={false}
      />
      {sheet}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: space.xxl },
  header: { gap: space.sm, marginBottom: space.lg },
  companyName: {
    fontFamily: type.title.family,
    fontSize: type.title.size,
    lineHeight: type.title.lineHeight,
    color: colors.ink,
  },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  balanceLabel: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  separator: { height: space.md },
  pagination: { marginTop: space.xl },
});
