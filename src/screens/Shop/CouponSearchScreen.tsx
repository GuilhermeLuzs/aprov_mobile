import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';
import {
  CoinBadge,
  EmptyState,
  LoadingState,
  SearchBar,
  SectionHeader,
  TopBar,
} from '../../components';
import { useCouponShelves } from '../../queries/coupons';
import type { ShopStackNavigation } from '../../navigation/types';
import { coinBalance, useWallet } from '../../queries/wallet';
import { colors, icon, radius, space, type } from '../../theme';
import type { Company } from '../../types';
import { formatInt } from '../../utils/format';

function couponCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'cupom' : 'cupons'}`;
}

export default function CouponSearchScreen() {
  const navigation = useNavigation<ShopStackNavigation<'CouponSearch'>>();
  const wallet = useWallet();
  const [query, setQuery] = useState('');
  const searching = query.trim() !== '';
  const shelves = useCouponShelves(1, query);
  const withCoupons = (shelves.data?.shelves ?? []).map((shelf) => ({
    company: shelf.company,
    balance: coinBalance(wallet, shelf.company.id),
    count: shelf.count,
  }));

  const open = (company: Company) => navigation.navigate('CompanyCoupons', { companyId: company.id });

  return (
    <View style={styles.screen}>
      <TopBar onBack={() => navigation.goBack()}>
        <SearchBar placeholder="Buscar empresas" value={query} onChangeText={setQuery} autoFocus />
      </TopBar>

      <FlatList
        data={withCoupons}
        keyExtractor={(row) => row.company.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListHeaderComponent={searching ? null : <SectionHeader title="Empresas com cupons" />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => open(item.company)}
            accessibilityRole="button"
            accessibilityLabel={`${item.company.name}, ${couponCountLabel(item.count)}`}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <CoinBadge icon={item.company.coinIcon} color={item.company.coinColor} size="lg" />
            <View style={styles.rowText}>
              <Text style={styles.name} numberOfLines={1}>
                {item.company.name}
              </Text>
              <Text style={styles.detail} numberOfLines={1}>
                {couponCountLabel(item.count)} · {formatInt(item.balance)} {item.company.coinName}
              </Text>
            </View>
            <ChevronRight size={icon.size.md} color={colors.inkFaint} strokeWidth={icon.strokeWidth} />
          </Pressable>
        )}
        ListEmptyComponent={
          shelves.isPending ? (
            <LoadingState />
          ) : (
          <EmptyState
            compact
            mood="confused"
            title="Nenhuma empresa encontrada"
            description="Confira o nome e tente de novo."
          />
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowPressed: { backgroundColor: colors.surfaceAlt },
  rowText: { flex: 1 },
  name: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.ink,
  },
  detail: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
});
