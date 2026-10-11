import { useLayoutEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { UserCheck, UserPlus } from 'lucide-react-native';
import {
  BottomSheet,
  Button,
  EmptyState,
  ProfileSummary,
  ReviewPost,
  SectionHeader,
} from '../../components';
import { colors, space, type } from '../../theme';
import { companies, products, reviews } from '../../mocks';
import {
  follow,
  followersOf,
  followingOf,
  isFollowing,
  unfollow,
  useFollows,
} from '../../store/follows';
import { useReviewDisplay } from '../../store/interactions';
import { usePublishedReviews } from '../../store/publishedReviews';
import { findUser, useCurrentUser } from '../../store/session';
import { byNewest } from '../../utils/date';
import { formatInt } from '../../utils/format';
import type { PeopleNavigation, PeopleParamList } from '../../navigation/types';
import { useOpenMedia } from '../Media/useOpenMedia';

export default function UserProfileScreen() {
  const route = useRoute<RouteProp<PeopleParamList, 'UserProfile'>>();
  const navigation = useNavigation<PeopleNavigation<'UserProfile'>>();
  const { userId } = route.params;
  const me = useCurrentUser();
  const display = useReviewDisplay(me.id);
  const openMedia = useOpenMedia();
  const published = usePublishedReviews();
  const follows = useFollows();
  const [confirmUnfollow, setConfirmUnfollow] = useState(false);

  const user = findUser(userId);

  useLayoutEffect(() => {
    if (user) navigation.setOptions({ title: user.handle });
  }, [navigation, user]);

  if (!user) {
    return (
      <View style={styles.notFound}>
        <EmptyState title="Perfil não encontrado" description="Não foi possível abrir este perfil." />
      </View>
    );
  }

  const firstName = user.name.split(' ')[0];
  const userReviews = [
    ...published.filter((r) => r.authorId === user.id),
    ...reviews.filter((r) => r.authorId === user.id).sort(byNewest),
  ];
  const mediaIds = userReviews.map((r) => r.id);
  const agreementsReceived = userReviews.reduce((sum, r) => sum + r.agreements, 0);
  const following = isFollowing(follows, me.id, user.id);

  const confirmAndUnfollow = () => {
    unfollow(me.id, user.id);
    setConfirmUnfollow(false);
  };

  const header = (
    <View style={styles.header}>
      <ProfileSummary
        user={user}
        level={user.level}
        reviews={userReviews.length}
        agreements={agreementsReceived}
        followers={followersOf(follows, user.id).length}
        following={followingOf(follows, user.id).length}
        onPressFollowers={() => navigation.push('FollowList', { userId: user.id, kind: 'followers' })}
        onPressFollowing={() => navigation.push('FollowList', { userId: user.id, kind: 'following' })}
        emptyBadgesText="Nenhuma badge ainda."
      >
        <View style={styles.follow}>
          <Button
            label={following ? 'Seguindo' : 'Seguir'}
            variant={following ? 'secondary' : 'primary'}
            icon={following ? UserCheck : UserPlus}
            fullWidth
            accessibilityLabel={following ? `Deixar de seguir ${user.name}` : `Seguir ${user.name}`}
            onPress={() => (following ? setConfirmUnfollow(true) : follow(me.id, user.id))}
          />
        </View>
      </ProfileSummary>

      <View style={styles.divider} />

      <SectionHeader title={`Avaliações · ${formatInt(userReviews.length)}`} />
    </View>
  );

  return (
    <>
      <FlatList
        style={styles.screen}
        contentContainerStyle={styles.content}
        data={userReviews}
        keyExtractor={(r) => r.id}
        ListHeaderComponent={header}
        ItemSeparatorComponent={Separator}
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
                onOpenMedia={(index) => openMedia(mediaIds, item.id, index)}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.gutter}>
            <EmptyState
              compact
              title={`${firstName} ainda não avaliou nada`}
              description="As avaliações publicadas aparecem aqui."
            />
          </View>
        }
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
