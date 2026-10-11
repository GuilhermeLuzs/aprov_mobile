import { useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import { BrandMark, EmptyState, ReviewPost, TopBar } from '../../components';
import { colors, icon, size, space, type } from '../../theme';
import { companies, products } from '../../mocks';
import type { Review } from '../../types';
import { followingOf, useFollows } from '../../store/follows';
import { useReviewDisplay } from '../../store/interactions';
import { usePreferences } from '../../store/preferences';
import { useAllReviews } from '../../store/publishedReviews';
import { findUser, useCurrentUser } from '../../store/session';
import { sortFeed, spaceAuthors } from '../../utils/feed';
import type { FeedStackNavigation } from '../../navigation/types';
import { useOpenProfile } from '../UserProfile/useOpenProfile';
import { useOpenMedia } from '../Media/useOpenMedia';

const BATCH_SIZE = 10;
const AUTHOR_GAP = 5;
const REFRESH_DELAY_MS = 400;

type FeedTab = 'forYou' | 'following';

const TABS: { key: FeedTab; label: string }[] = [
  { key: 'forYou', label: 'Para você' },
  { key: 'following', label: 'Seguindo' },
];

const EMPTY_COPY: Record<FeedTab, { title: string; description: string }> = {
  forYou: {
    title: 'Nada por aqui ainda',
    description: 'Quando alguém publicar uma avaliação, ela aparece aqui.',
  },
  following: {
    title: 'Nada de quem você segue',
    description: 'Quando alguém que você segue publicar uma avaliação, ela aparece aqui.',
  },
};

const noPreference = () => false;

export default function FeedScreen() {
  const navigation = useNavigation<FeedStackNavigation<'Feed'>>();
  const listRef = useRef<FlatList<Review>>(null);
  const me = useCurrentUser();
  const display = useReviewDisplay(me.id);
  const openMedia = useOpenMedia();
  const openProfile = useOpenProfile();
  const allReviews = useAllReviews();
  const preferences = usePreferences();
  const following = followingOf(useFollows(), me.id);
  const [tab, setTab] = useState<FeedTab>('forYou');
  const [loaded, setLoaded] = useState(BATCH_SIZE);
  const [refreshing, setRefreshing] = useState(false);

  const productOf = (review: Review) => products.find((p) => p.id === review.productId);

  const isPreferred = (review: Review) => {
    const product = productOf(review);
    if (!product) return false;
    return (
      preferences.companyIds.includes(product.companyId) ||
      preferences.categories.includes(product.category)
    );
  };

  const all = allReviews.filter((r) => productOf(r) !== undefined);
  const scoped = tab === 'following' ? all.filter((r) => following.includes(r.authorId)) : all;
  const feed = spaceAuthors(
    sortFeed(scoped, tab === 'forYou' ? isPreferred : noPreference),
    AUTHOR_GAP,
  );
  const mediaIds = feed.map((r) => r.id);
  const visible = feed.slice(0, loaded);
  const exhausted = loaded >= feed.length;

  const switchTab = (next: FeedTab) => {
    if (next === tab) return;
    setTab(next);
    setLoaded(BATCH_SIZE);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  const loadMore = () => {
    if (!exhausted) setLoaded((n) => n + BATCH_SIZE);
  };

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLoaded(BATCH_SIZE);
      setRefreshing(false);
    }, REFRESH_DELAY_MS);
  };

  return (
    <View style={styles.screen}>
      <TopBar style={styles.tabs}>
        <BrandMark />
        <View style={styles.tabList} accessibilityRole="tablist">
          {TABS.map((t) => (
            <TabButton
              key={t.key}
              label={t.label}
              active={tab === t.key}
              onPress={() => switchTab(t.key)}
            />
          ))}
        </View>
        <Pressable
          style={styles.searchButton}
          onPress={() => navigation.navigate('PeopleSearch')}
          hitSlop={space.sm}
          accessibilityRole="button"
          accessibilityLabel="Pesquisar pessoas"
        >
          <Search size={icon.size.lg} color={colors.ink} strokeWidth={icon.strokeWidth} />
        </Pressable>
      </TopBar>

      <FlatList
        ref={listRef}
        data={visible}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => {
          const author = findUser(item.authorId);
          const product = productOf(item);
          const company = product ? companies.find((c) => c.id === product.companyId) : undefined;
          if (!author || !product || !company) return null;
          return (
            <ReviewPost
              {...display(item)}
              author={author}
              product={product}
              company={company}
              onPressAuthor={() => openProfile(author.id)}
              onPressProduct={() => navigation.navigate('ProductDetails', { productId: product.id })}
              onPressBody={() => navigation.navigate('ReviewDetails', { reviewId: item.id })}
              onOpenMedia={(index) => openMedia(mediaIds, item.id, index)}
            />
          );
        }}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <EmptyState title={EMPTY_COPY[tab].title} description={EMPTY_COPY[tab].description} />
        }
        ListFooterComponent={
          visible.length > 0 && exhausted ? <Text style={styles.end}>Você chegou ao fim</Text> : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      />
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.tab}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
      <View style={[styles.tabIndicator, active && styles.tabIndicatorActive]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  tabList: {
    flex: 1,
    flexDirection: 'row',
    gap: space.xl,
  },
  searchButton: {
    width: size.control,
    height: size.control,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  tab: {
    minHeight: size.control,
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: space.xs,
  },
  tabLabel: {
    fontFamily: type.subtitle.family,
    fontSize: type.subtitle.size,
    lineHeight: type.subtitle.lineHeight,
    color: colors.inkMuted,
  },
  tabLabelActive: { color: colors.ink },
  tabIndicator: {
    height: size.tabIndicator,
    alignSelf: 'stretch',
  },
  tabIndicatorActive: { backgroundColor: colors.primary },
  content: {
    padding: space.lg,
    paddingBottom: space.xl,
  },
  separator: { height: space.md },
  end: {
    textAlign: 'center',
    paddingVertical: space.xl,
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
});
