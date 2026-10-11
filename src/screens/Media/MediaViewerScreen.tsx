import { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useNavigation, useRoute, type NavigatorScreenParams, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { X } from 'lucide-react-native';
import { colors, icon, radius, size, space, type } from '../../theme';
import { companies, products } from '../../mocks';
import type { Review } from '../../types';
import { useReviewDisplay } from '../../store/interactions';
import { useAllReviews } from '../../store/publishedReviews';
import { findUser, useCurrentUser } from '../../store/session';
import { slidesOf } from '../../utils/media';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { CommentsSheet } from './CommentsSheet';
import { useReport } from '../Report/useReport';
import { MediaPost } from './MediaPost';

type Size = { width: number; height: number };

type TabTarget =
  | { screen: 'ReviewDetails'; params: { reviewId: string } }
  | { screen: 'UserProfile'; params: { userId: string } }
  | { screen: 'ProductDetails'; params: { productId: string } };

function inTab(
  tab: keyof MainTabParamList,
  target: TabTarget,
): NavigatorScreenParams<MainTabParamList> {
  switch (tab) {
    case 'HomeTab':
      return { screen: 'HomeTab', params: target };
    case 'FeedTab':
      return { screen: 'FeedTab', params: target };
    case 'ProfileTab':
      return { screen: 'ProfileTab', params: target };
  }
}

export default function MediaViewerScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'MediaViewer'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { reviewIds, reviewId, index, originTab } = route.params;
  const me = useCurrentUser();
  const display = useReviewDisplay(me.id);
  const allReviews = useAllReviews();
  const report = useReport();

  const posts = reviewIds
    .map((id) => allReviews.find((r) => r.id === id))
    .filter((r): r is Review => r !== undefined && r.media.length > 0);
  const startPost = Math.max(0, posts.findIndex((r) => r.id === reviewId));

  const [frame, setFrame] = useState<Size | null>(null);
  const [current, setCurrent] = useState(startPost);
  const currentRef = useRef(startPost);
  const [zoomed, setZoomed] = useState(false);
  const [muted, setMuted] = useState(false);
  const [infoCollapsed, setInfoCollapsed] = useState(false);
  const [commentsFor, setCommentsFor] = useState<string | null>(null);

  const openAuthor = (authorId: string) => {
    if (authorId === me.id) {
      navigation.popTo('MainTabs', { screen: 'ProfileTab', params: { screen: 'Profile', pop: true } });
      return;
    }
    navigation.popTo('MainTabs', inTab(originTab, { screen: 'UserProfile', params: { userId: authorId } }));
  };

  const openDetails = (id: string) =>
    navigation.popTo('MainTabs', inTab(originTab, { screen: 'ReviewDetails', params: { reviewId: id } }));

  const openProduct = (productId: string) =>
    navigation.popTo('MainTabs', inTab(originTab, { screen: 'ProductDetails', params: { productId } }));

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!frame || frame.width !== width || frame.height !== height) setFrame({ width, height });
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!frame) return;
    const next = Math.round(e.nativeEvent.contentOffset.y / frame.height);
    if (next !== currentRef.current) {
      currentRef.current = next;
      setCurrent(next);
      setZoomed(false);
    }
  };

  return (
    <View style={styles.screen} onLayout={onLayout}>
      <StatusBar style="light" />
      {frame && posts.length > 0 ? (
        <FlatList
          data={posts}
          keyExtractor={(r) => r.id}
          pagingEnabled
          scrollEnabled={!zoomed}
          showsVerticalScrollIndicator={false}
          initialScrollIndex={startPost}
          getItemLayout={(_, i) => ({ length: frame.height, offset: frame.height * i, index: i })}
          onScroll={onScroll}
          scrollEventThrottle={16}
          windowSize={3}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          renderItem={({ item, index: postIndex }) => {
            const { review, vote, onVote } = display(item);
            const slides = slidesOf(item.media);
            const product = products.find((p) => p.id === item.productId);
            return (
              <MediaPost
                review={review}
                author={item.authorId === me.id ? me : findUser(item.authorId)}
                product={product}
                company={companies.find((c) => c.id === product?.companyId)}
                slides={slides}
                width={frame.width}
                height={frame.height}
                active={postIndex === current}
                startIndex={item.id === reviewId ? Math.min(index, slides.length - 1) : 0}
                zoomed={zoomed}
                onZoomChange={setZoomed}
                muted={muted}
                onToggleMuted={() => setMuted((m) => !m)}
                vote={vote}
                onVote={onVote}
                onOpenComments={() => setCommentsFor(item.id)}
                onOpenAuthor={() => openAuthor(item.authorId)}
                onOpenDetails={() => openDetails(item.id)}
                onOpenProduct={() => openProduct(item.productId)}
                infoCollapsed={infoCollapsed}
                onToggleInfo={() => setInfoCollapsed((c) => !c)}
                onReport={
                  report.canReport(item.authorId) ? () => report.open('review', item.id) : undefined
                }
              />
            );
          }}
        />
      ) : null}

      {frame && posts.length === 0 ? (
        <Text style={styles.missing}>Esta mídia não está mais disponível.</Text>
      ) : null}

      <Pressable
        onPress={() => navigation.goBack()}
        hitSlop={space.sm}
        accessibilityRole="button"
        accessibilityLabel="Fechar"
        style={[styles.close, { top: insets.top + space.sm }]}
      >
        <X size={icon.size.lg} color={colors.surface} strokeWidth={icon.strokeWidth} />
      </Pressable>

      {report.sheet}

      <CommentsSheet
        review={allReviews.find((r) => r.id === commentsFor)}
        onClose={() => setCommentsFor(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', backgroundColor: colors.mediaBackdrop },
  close: {
    position: 'absolute',
    left: space.lg,
    width: size.control,
    height: size.control,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mediaControl,
  },
  missing: {
    textAlign: 'center',
    paddingHorizontal: space.lg,
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.surface,
  },
});
