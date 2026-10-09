import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bookmark,
  ChevronRight,
  Menu,
  Receipt,
  Wallet as WalletIcon,
  type LucideIcon,
} from 'lucide-react-native';
import { Avatar, BottomSheet, EmptyState, ReviewPost, SectionHeader } from '../../components';
import { colors, icon, radius, size, space, type } from '../../theme';
import { companies, products, reviews, xpPerLevel } from '../../mocks';
import { usePublishedReviews } from '../../store/publishedReviews';
import { useUserItems } from '../../store/userItems';
import { useCurrentUser } from '../../store/session';
import { useWallet } from '../../store/wallet';
import { formatInt } from '../../utils/format';
import { levelProgress } from '../../utils/level';
import type { ProfileStackNavigation } from '../../navigation/types';

function byNewest(a: { createdAt: string }, b: { createdAt: string }): number {
  return Date.parse(b.createdAt) - Date.parse(a.createdAt);
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ProfileStackNavigation<'Profile'>>();
  const user = useCurrentUser();
  const wallet = useWallet();
  const items = useUserItems();
  const published = usePublishedReviews();
  const [menuOpen, setMenuOpen] = useState(false);

  const myReviews = [
    ...published.filter((r) => r.authorId === user.id),
    ...reviews.filter((r) => r.authorId === user.id).sort(byNewest),
  ];
  const agreementsReceived = myReviews.reduce((sum, r) => sum + r.agreements, 0);
  const progress = levelProgress(wallet.xp, xpPerLevel);

  const openFromMenu = (open: () => void) => {
    setMenuOpen(false);
    open();
  };

  const header = (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <Text style={styles.handle} numberOfLines={1}>
          {user.handle}
        </Text>
        <Pressable
          style={styles.menuButton}
          onPress={() => setMenuOpen(true)}
          hitSlop={space.sm}
          accessibilityRole="button"
          accessibilityLabel="Abrir menu do perfil"
        >
          <Menu size={icon.size.lg} color={colors.ink} strokeWidth={icon.strokeWidth} />
        </Pressable>
      </View>

      <View style={styles.identity}>
        <Avatar uri={user.avatarUri} name={user.name} size="lg" bordered />
        <View style={styles.identityText}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.levelLabel}>Nível {progress.level}</Text>
        </View>
      </View>

      {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

      <View style={styles.level}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress.progress * 100}%` }]} />
        </View>
        <Text style={styles.levelText}>
          {formatInt(progress.xpInLevel)}/{formatInt(xpPerLevel)} XP · faltam{' '}
          {formatInt(progress.xpToNext)} para o nível {progress.level + 1}
        </Text>
      </View>

      <View style={styles.stats}>
        <Stat value={myReviews.length} label={myReviews.length === 1 ? 'avaliação' : 'avaliações'} />
        <Stat
          value={agreementsReceived}
          label={agreementsReceived === 1 ? 'concordância recebida' : 'concordâncias recebidas'}
        />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Badges" />
        {user.badges.length > 0 ? null : (
          <Text style={styles.emptyLine}>
            Nenhuma badge ainda. Elas chegam conforme você avalia itens das empresas parceiras.
          </Text>
        )}
      </View>

      <View style={styles.divider} />

      <SectionHeader title={`Suas avaliações · ${formatInt(myReviews.length)}`} />
    </View>
  );

  return (
    <>
      <FlatList
        style={styles.screen}
        contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingBottom: space.xxl }}
        data={myReviews}
        keyExtractor={(r) => r.id}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => {
          const product = products.find((p) => p.id === item.productId);
          const company = companies.find((c) => c.id === item.companyId);
          if (!product || !company) return null;
          return (
            <View style={styles.gutter}>
              <ReviewPost
                review={item}
                author={user}
                product={product}
                company={company}
                showAuthor={false}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.gutter}>
            <EmptyState
              compact
              title="Você ainda não avaliou nada"
              description="Suas avaliações publicadas aparecem aqui."
              action={{
                label: 'Explorar itens',
                onPress: () => navigation.navigate('MainTabs', { screen: 'HomeTab', params: { screen: 'Home' } }),
              }}
            />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <BottomSheet
        visible={menuOpen}
        title="Menu"
        closeLabel="Fechar menu"
        onClose={() => setMenuOpen(false)}
      >
        <View style={styles.menuList}>
          <MenuRow
            Icon={WalletIcon}
            label="Carteira"
            detail={`${formatInt(wallet.aprovPoints)} pontos APROV`}
            onPress={() => openFromMenu(() => navigation.navigate('Wallet'))}
          />
          <MenuRow
            Icon={Bookmark}
            label="Itens salvos"
            detail={`${formatInt(items.savedIds.length)} ${items.savedIds.length === 1 ? 'item' : 'itens'}`}
            onPress={() => openFromMenu(() => navigation.navigate('ItemList', { kind: 'saved' }))}
          />
          <MenuRow
            Icon={Receipt}
            label="Itens comprados"
            detail={`${formatInt(items.purchasedIds.length)} ${items.purchasedIds.length === 1 ? 'item' : 'itens'}`}
            onPress={() => openFromMenu(() => navigation.navigate('ItemList', { kind: 'purchased' }))}
          />
        </View>
      </BottomSheet>
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <Text style={styles.statText}>
      <Text style={styles.statNumber}>{formatInt(value)}</Text> {label}
    </Text>
  );
}

function MenuRow({
  Icon,
  label,
  detail,
  onPress,
}: {
  Icon: LucideIcon;
  label: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${detail}`}
      style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
    >
      <Icon size={icon.size.lg} color={colors.ink} strokeWidth={icon.strokeWidth} />
      <View style={styles.menuText}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuDetail}>{detail}</Text>
      </View>
      <ChevronRight size={icon.size.md} color={colors.inkFaint} strokeWidth={icon.strokeWidth} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  gutter: { paddingHorizontal: space.lg },
  header: { paddingHorizontal: space.lg },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  handle: {
    flex: 1,
    fontFamily: type.subtitle.family,
    fontSize: type.subtitle.size,
    lineHeight: type.subtitle.lineHeight,
    color: colors.ink,
  },
  menuButton: {
    width: size.control,
    height: size.control,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  identityText: { flex: 1 },
  name: {
    fontFamily: type.title.family,
    fontSize: type.title.size,
    lineHeight: type.title.lineHeight,
    color: colors.ink,
  },
  levelLabel: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  bio: {
    marginTop: space.md,
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
  level: { marginTop: space.lg, gap: space.xs },
  track: {
    height: size.progressBar,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.value,
  },
  levelText: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  stats: {
    marginTop: space.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.lg,
  },
  statText: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
  statNumber: {
    fontFamily: type.numeric.family,
    color: colors.ink,
  },
  section: { marginTop: space.xl },
  emptyLine: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkFaint,
  },
  divider: {
    height: 1,
    marginVertical: space.lg,
    backgroundColor: colors.border,
  },
  separator: { height: space.md },
  menuList: { paddingHorizontal: space.lg, paddingVertical: space.md, gap: space.xs },
  menuRow: {
    minHeight: size.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    borderRadius: radius.control,
  },
  menuRowPressed: { backgroundColor: colors.surfaceAlt },
  menuText: { flex: 1 },
  menuLabel: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.ink,
  },
  menuDetail: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
});
