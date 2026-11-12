import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Award, ChevronRight, Store } from 'lucide-react-native';
import { Button, CoinBadge, EmptyState, SectionHeader } from '../../components';
import type { ProfileStackNavigation } from '../../navigation/types';
import { colors, icon, radius, space, type } from '../../theme';
import { coupons } from '../../mocks';
import { useWallet } from '../../queries/wallet';
import { formatInt } from '../../utils/format';

export default function WalletScreen() {
  const navigation = useNavigation<ProfileStackNavigation<'Wallet'>>();
  const wallet = useWallet();

  const openCoupons = (companyId: string) =>
    navigation.navigate('MainTabs', {
      screen: 'ShopTab',
      params: { screen: 'CompanyCoupons', params: { companyId }, initial: false },
    });

  const balances = wallet.coins
    .filter((c) => c.amount > 0)
    .filter((c) => c.company !== undefined)
    .sort((a, b) => b.amount - a.amount);

  const header = (
    <View>
      <View style={styles.pointsCard}>
        <View style={styles.pointsRow}>
          <Award size={icon.size.lg} color={colors.surface} strokeWidth={icon.strokeWidth} />
          <Text style={styles.pointsLabel}>Pontos APROV</Text>
        </View>
        <Text style={styles.pointsValue}>{formatInt(wallet.aprovPoints)}</Text>
        <Text style={styles.pointsHint}>Você ganha pontos a cada avaliação publicada.</Text>
        <Button
          label="Gastar pontos"
          icon={Store}
          tone="onBrand"
          onPress={() => navigation.navigate('MainTabs', { screen: 'ShopTab' })}
          style={styles.spendButton}
        />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Moedas das empresas" />
        <Text style={styles.sectionHint}>
          Cada empresa parceira tem a sua moeda, que depois vira cupom com ela.
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={balances}
      keyExtractor={(b) => b.companyId}
      ListHeaderComponent={header}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => {
        if (!item.company) return null;
        const hasCoupons = coupons.some((c) => c.companyId === item.companyId);
        return (
          <Pressable
            onPress={hasCoupons ? () => openCoupons(item.companyId) : undefined}
            disabled={!hasCoupons}
            accessibilityRole={hasCoupons ? 'button' : undefined}
            accessibilityLabel={
              hasCoupons ? `${item.company.coinName}, ver cupons` : item.company.coinName
            }
            style={({ pressed }) => [styles.coinRow, pressed && styles.coinRowPressed]}
          >
            <CoinBadge icon={item.company.coinIcon} color={item.company.coinColor} size="lg" />
            <View style={styles.coinText}>
              <Text style={styles.coinName} numberOfLines={1}>
                {item.company.coinName}
              </Text>
              <Text style={styles.companyName} numberOfLines={1}>
                {item.company.name}
              </Text>
            </View>
            <View style={styles.coinEnd}>
              <Text style={styles.coinAmount}>{formatInt(item.amount)}</Text>
              {hasCoupons ? (
                <View style={styles.couponsLink}>
                  <Text style={styles.couponsLinkText}>Ver cupons</Text>
                  <ChevronRight size={icon.size.sm} color={colors.primary} strokeWidth={icon.strokeWidth} />
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState
          compact
          title="Nenhuma moeda ainda"
          description="Avalie itens de empresas parceiras para começar a juntar."
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: space.xxl },
  pointsCard: {
    padding: space.xl,
    borderRadius: radius.card,
    backgroundColor: colors.primaryBright,
    gap: space.xs,
  },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  pointsLabel: {
    fontFamily: type.subtitle.family,
    fontSize: type.subtitle.size,
    lineHeight: type.subtitle.lineHeight,
    color: colors.surface,
  },
  pointsValue: {
    fontFamily: type.display.family,
    fontSize: type.display.size,
    lineHeight: type.display.lineHeight,
    color: colors.surface,
  },
  spendButton: { marginTop: space.md },
  pointsHint: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.valueDim,
  },
  section: { marginTop: space.xl, marginBottom: space.md },
  sectionHint: {
    marginTop: -space.sm,
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  separator: { height: space.sm },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  coinRowPressed: { backgroundColor: colors.surfaceAlt },
  coinText: { flex: 1 },
  coinEnd: { alignItems: 'flex-end', gap: space.xs },
  couponsLink: { flexDirection: 'row', alignItems: 'center' },
  couponsLinkText: {
    fontFamily: type.bodyBold.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.primary,
  },
  coinAmount: {
    fontFamily: type.numeric.family,
    fontSize: type.numeric.size,
    lineHeight: type.numeric.lineHeight,
    color: colors.ink,
  },
  coinName: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.ink,
  },
  companyName: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
});
