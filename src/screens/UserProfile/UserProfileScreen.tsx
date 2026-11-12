import { useLayoutEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { UserCheck, UserPlus } from 'lucide-react-native';
import {
  BottomSheet,
  Button,
  EmptyState,
  LoadError,
  LoadingState,
  ProfileSummary,
  ReviewPost,
  SectionHeader,
} from '../../components';
import { colors, space, type } from '../../theme';
import { ApiError } from '../../api';
import { setFollowing, useProfile } from '../../queries/people';
import { useCustomerReviews, useReviewDisplay } from '../../queries/reviews';
import { formatInt } from '../../utils/format';
import type { PeopleNavigation, PeopleParamList } from '../../navigation/types';
import { useOpenMedia } from '../Media/useOpenMedia';
import { useReport } from '../Report/useReport';

const NOT_FOUND = 404;

export default function UserProfileScreen() {
  const route = useRoute<RouteProp<PeopleParamList, 'UserProfile'>>();
  const navigation = useNavigation<PeopleNavigation<'UserProfile'>>();
  const { userId } = route.params;
  const display = useReviewDisplay();
  const openMedia = useOpenMedia();
  const report = useReport();
  const profile = useProfile(userId);
  const reviews = useCustomerReviews(userId);
  const [confirmUnfollow, setConfirmUnfollow] = useState(false);

  const user = profile.data?.user;

  useLayoutEffect(() => {
    if (user) navigation.setOptions({ title: user.handle });
  }, [navigation, user]);

  if (profile.isPending) return <LoadingState fill />;

  if (!profile.data || !user) {
    const missing = profile.error instanceof ApiError && profile.error.status === NOT_FOUND;
    return (
      <View style={styles.notFound}>
        {missing ? (
          <EmptyState mood="confused" title="Perfil não encontrado" description="Não foi possível abrir este perfil." />
        ) : (
          <LoadError onRetry={() => void profile.refetch()} />
        )}
      </View>
    );
  }

  const { followerCount, followingCount, isFollowing } = profile.data;
  const firstName = user.name.split(' ')[0];
  const mediaIds = reviews.entries.map((entry) => entry.review.id);

  const confirmAndUnfollow = () => {
    void setFollowing(userId, false);
    setConfirmUnfollow(false);
  };

  const header = (
    <View style={styles.header}>
      <ProfileSummary
        user={user}
        level={user.level}
        reviews={user.reviewCount}
        agreements={user.agreementsReceived}
        followers={followerCount}
        following={followingCount}
        onPressFollowers={() => navigation.push('FollowList', { userId: user.id, kind: 'followers' })}
        onPressFollowing={() => navigation.push('FollowList', { userId: user.id, kind: 'following' })}
        emptyBadgesText="Nenhuma badge ainda."
      >
        <View style={styles.follow}>
          <Button
            label={isFollowing ? 'Seguindo' : 'Seguir'}
            variant={isFollowing ? 'secondary' : 'primary'}
            icon={isFollowing ? UserCheck : UserPlus}
            fullWidth
            accessibilityLabel={isFollowing ? `Deixar de seguir ${user.name}` : `Seguir ${user.name}`}
            onPress={() => (isFollowing ? setConfirmUnfollow(true) : void setFollowing(userId, true))}
          />
        </View>
      </ProfileSummary>

      <View style={styles.divider} />

      <SectionHeader title={`Avaliações · ${formatInt(user.reviewCount)}`} />
    </View>
  );

  return (
    <>
      <FlatList
        style={styles.screen}
        contentContainerStyle={styles.content}
        data={reviews.entries}
        keyExtractor={(entry) => entry.review.id}
        ListHeaderComponent={header}
        ItemSeparatorComponent={Separator}
        renderItem={({ item: { review, product, company } }) => {
          if (!company) return null;
          return (
            <View style={styles.gutter}>
              <ReviewPost
                {...display(review)}
                author={user}
                product={product}
                company={company}
                showAuthor={false}
                onPressProduct={() => navigation.navigate('ProductDetails', { productId: product.id })}
                onPressBody={() => navigation.navigate('ReviewDetails', { reviewId: review.id })}
                onOpenMedia={(index) => openMedia(mediaIds, review.id, index)}
                onReport={
                  report.canReport(review.authorId) ? () => report.open('review', review.id) : undefined
                }
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.gutter}>
            {reviews.isPending ? (
              <LoadingState />
            ) : reviews.isError ? (
              <LoadError compact onRetry={() => void reviews.refetch()} />
            ) : (
              <EmptyState
                compact
                title={`${firstName} ainda não avaliou nada`}
                description="As avaliações publicadas aparecem aqui."
              />
            )}
          </View>
        }
        ListFooterComponent={reviews.isFetchingNextPage ? <LoadingState /> : null}
        onEndReached={() => {
          if (reviews.hasNextPage && !reviews.isFetchingNextPage) void reviews.fetchNextPage();
        }}
        showsVerticalScrollIndicator={false}
      />

      <BottomSheet
        visible={confirmUnfollow}
        title={`Deixar de seguir ${firstName}?`}
        closeLabel="Continuar seguindo"
        onClose={() => setConfirmUnfollow(false)}
        footer={
          <>
            <Button
              label="Cancelar"
              variant="secondary"
              onPress={() => setConfirmUnfollow(false)}
              style={styles.sheetButton}
            />
            <Button label="Deixar de seguir" onPress={confirmAndUnfollow} style={styles.sheetButton} />
          </>
        }
      >
        <Text style={styles.sheetText}>
          As avaliações de {firstName} deixam de aparecer na aba Seguindo do Feed.
        </Text>
      </BottomSheet>
      {report.sheet}
    </>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingTop: space.lg, paddingBottom: space.xxl },
  notFound: { flex: 1, justifyContent: 'center', padding: space.lg, backgroundColor: colors.bg },
  header: { paddingHorizontal: space.lg },
  gutter: { paddingHorizontal: space.lg },
  follow: { marginTop: space.lg },
  divider: {
    height: 1,
    marginVertical: space.lg,
    backgroundColor: colors.border,
  },
  separator: { height: space.md },
  sheetText: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
  sheetButton: { flex: 1 },
});
