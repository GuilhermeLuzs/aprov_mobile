import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Award } from 'lucide-react-native';
import { EmptyState, RewardAmount, SectionHeader } from '../../components';
import { colors, icon, radius, size, space, type } from '../../theme';
import { companies } from '../../mocks';
import { useWallet } from '../../store/wallet';
import { formatInt } from '../../utils/format';

export default function WalletScreen() {
  const wallet = useWallet();

  const balances = wallet.coins
    .filter((c) => c.amount > 0)
    .map((c) => ({ ...c, company: companies.find((co) => co.id === c.companyId) }))
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
      renderItem={({ item }) =>
        item.company ? (
          <View style={styles.coinRow}>
            <Image
              source={{ uri: item.company.coinIconUri }}
              style={styles.coinIcon}
              accessibilityIgnoresInvertColors
            />
            <View style={styles.coinText}>
              <Text style={styles.coinName} numberOfLines={1}>
                {item.company.coinName}
              </Text>
              <Text style={styles.companyName} numberOfLines={1}>
                {item.company.name}
              </Text>
            </View>
            <RewardAmount amount={item.amount} />
          </View>
        ) : null
      }
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
  coinIcon: {
    width: size.control,
    height: size.control,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  coinText: { flex: 1 },
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
