import { useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import {
  BrandMark,
  EmptyState,
  LoadError,
  LoadingState,
  ReviewPost,
  TabButton,
  TopBar,
} from '../../components';
import { colors, icon, size, space, type } from '../../theme';
import type { FeedTab } from '../../api';
import { useFeed, useReviewDisplay, type ReviewEntry } from '../../queries/reviews';
import type { FeedStackNavigation } from '../../navigation/types';
import { useOpenProfile } from '../UserProfile/useOpenProfile';
import { useOpenMedia } from '../Media/useOpenMedia';
import { useReport } from '../Report/useReport';

const TABS: { key: FeedTab; label: string }[] = [
  { key: 'for_you', label: 'Para você' },
  { key: 'following', label: 'Seguindo' },
];

const EMPTY_COPY: Record<FeedTab, { title: string; description: string }> = {
  for_you: {
    title: 'Nada por aqui ainda',
    description: 'Quando alguém publicar uma avaliação, ela aparece aqui.',
  },
  following: {
    title: 'Nada de quem você segue',
    description: 'Quando alguém que você segue publicar uma avaliação, ela aparece aqui.',
  },
};

export default function FeedScreen() {
  const navigation = useNavigation<FeedStackNavigation<'Feed'>>();
  const listRef = useRef<FlatList<ReviewEntry>>(null);
  const display = useReviewDisplay();
  const openMedia = useOpenMedia();
  const report = useReport();
  const openProfile = useOpenProfile();
  const [tab, setTab] = useState<FeedTab>('for_you');
  const feed = useFeed(tab);
  const [refreshing, setRefreshing] = useState(false);

  const mediaIds = feed.entries.map((entry) => entry.review.id);
  const exhausted = !feed.hasNextPage;

  const switchTab = (next: FeedTab) => {
    if (next === tab) return;
    setTab(next);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  const loadMore = () => {
    if (feed.hasNextPage && !feed.isFetchingNextPage) void feed.fetchNextPage();
  };

  const refresh = async () => {
    setRefreshing(true);
    await feed.refetch();
    setRefreshing(false);
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
        data={feed.entries}
        keyExtractor={(entry) => entry.review.id}
        renderItem={({ item: { review, author, product, company } }) => {
          if (!company) return null;
          return (
            <ReviewPost
              {...display(review)}
              author={author}
              product={product}
              company={company}
              onPressAuthor={() => openProfile(author.id)}
              onPressProduct={() => navigation.navigate('ProductDetails', { productId: product.id })}
              onPressBody={() => navigation.navigate('ReviewDetails', { reviewId: review.id })}
              onOpenMedia={(index) => openMedia(mediaIds, review.id, index)}
              onReport={
                report.canReport(review.authorId) ? () => report.open('review', review.id) : undefined
              }
            />
          );
        }}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          feed.isPending ? (
            <LoadingState />
          ) : feed.isError ? (
            <LoadError onRetry={() => void feed.refetch()} />
          ) : (
            <EmptyState title={EMPTY_COPY[tab].title} description={EMPTY_COPY[tab].description} />
          )
        }
        ListFooterComponent={
          feed.isFetchingNextPage ? (
            <LoadingState />
          ) : feed.entries.length > 0 && exhausted ? (
            <Text style={styles.end}>Você chegou ao fim</Text>
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refresh()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      />
      {report.sheet}
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
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
