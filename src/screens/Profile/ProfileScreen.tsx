import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Bookmark,
  LogOut,
  Menu,
  Receipt,
  UserPen,
  Wallet as WalletIcon,
} from 'lucide-react-native';
import {
  BottomSheet,
  BrandMark,
  EmptyState,
  MenuRow,
  ProfileSummary,
  ReviewPost,
  SectionHeader,
  TopBar,
} from '../../components';
import { colors, icon, radius, size, space, type } from '../../theme';
import { companies, products, reviews, xpPerLevel } from '../../mocks';
import { followersOf, followingOf, useFollows } from '../../store/follows';
import { useReviewDisplay } from '../../store/interactions';
import { usePublishedReviews } from '../../store/publishedReviews';
import { signOut, useCurrentUser } from '../../store/session';
import { useUserItems } from '../../store/userItems';
import { useWallet } from '../../store/wallet';
import { byNewest } from '../../utils/date';
import { formatInt } from '../../utils/format';
import { levelProgress } from '../../utils/level';
import type { ProfileStackNavigation } from '../../navigation/types';

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileStackNavigation<'Profile'>>();
  const user = useCurrentUser();
  const display = useReviewDisplay(user.id);
  const wallet = useWallet();
  const items = useUserItems();
  const published = usePublishedReviews();
  const follows = useFollows();
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
      <ProfileSummary
        user={user}
        level={progress.level}
        reviews={myReviews.length}
        agreements={agreementsReceived}
        followers={followersOf(follows, user.id).length}
        following={followingOf(follows, user.id).length}
        onPressFollowers={() => navigation.navigate('FollowList', { userId: user.id, kind: 'followers' })}
        onPressFollowing={() => navigation.navigate('FollowList', { userId: user.id, kind: 'following' })}
        emptyBadgesText="Nenhuma badge ainda. Elas chegam conforme você avalia itens das empresas parceiras."
      >
        <View style={styles.level}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress.progress * 100}%` }]} />
          </View>
          <Text style={styles.levelText}>
            {formatInt(progress.xpInLevel)}/{formatInt(xpPerLevel)} XP · faltam{' '}
            {formatInt(progress.xpToNext)} para o nível {progress.level + 1}
          </Text>
        </View>
      </ProfileSummary>

      <View style={styles.divider} />

      <SectionHeader title={`Suas avaliações · ${formatInt(myReviews.length)}`} />
    </View>
  );

  return (
    <View style={styles.screen}>
      <TopBar style={styles.topRow}>
        <BrandMark />
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
      </TopBar>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
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
                {...display(item)}
                author={user}
                product={product}
                company={company}
                showAuthor={false}
                onPressProduct={() => navigation.navigate('ProductDetails', { productId: product.id })}
                onPressBody={() => navigation.navigate('ReviewDetails', { reviewId: item.id })}
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
            Icon={UserPen}
            label="Editar perfil"
            detail="Foto, nome, @ e bio"
            onPress={() => openFromMenu(() => navigation.navigate('EditProfile'))}
          />
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
          <MenuRow
            Icon={LogOut}
            label="Sair"
            detail={user.handle}
            onPress={() =>
              openFromMenu(() => {
                signOut();
                navigation.getParent()?.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
              })
            }
          />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { flex: 1 },
  content: { paddingTop: space.lg, paddingBottom: space.xxl },
  gutter: { paddingHorizontal: space.lg },
  header: { paddingHorizontal: space.lg },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
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
  divider: {
    height: 1,
    marginVertical: space.lg,
    backgroundColor: colors.border,
  },
  separator: { height: space.md },
  menuList: { paddingHorizontal: space.lg, paddingVertical: space.md, gap: space.xs },
});
