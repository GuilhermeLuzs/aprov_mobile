import { FlatList, StyleSheet } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { EmptyState, PersonRow } from '../../components';
import { colors, space } from '../../theme';
import type { User } from '../../types';
import { followersOf, followingOf, useFollows } from '../../store/follows';
import { findUser, useCurrentUser } from '../../store/session';
import type { FollowListKind, PeopleParamList } from '../../navigation/types';
import { useOpenProfile } from './useOpenProfile';

function emptyTitle(kind: FollowListKind, ownerName: string | null): string {
  if (kind === 'followers') {
    return ownerName ? `Ninguém segue ${ownerName} ainda` : 'Ninguém segue você ainda';
  }
  return ownerName ? `${ownerName} ainda não segue ninguém` : 'Você ainda não segue ninguém';
}

export default function FollowListScreen() {
  const route = useRoute<RouteProp<PeopleParamList, 'FollowList'>>();
  const { userId, kind } = route.params;
  const me = useCurrentUser();
  const follows = useFollows();
  const openProfile = useOpenProfile();

  const isMine = userId === me.id;
  const owner = isMine ? me : findUser(userId);
  const ids = kind === 'followers' ? followersOf(follows, userId) : followingOf(follows, userId);
  const people = ids
    .map((id) => (id === me.id ? me : findUser(id)))
    .filter((u): u is User => u !== undefined);

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={people}
      keyExtractor={(u) => u.id}
      renderItem={({ item }) => <PersonRow user={item} onPress={() => openProfile(item.id)} />}
      ListEmptyComponent={
        <EmptyState
          compact
          title={emptyTitle(kind, isMine ? null : owner?.name.split(' ')[0] ?? null)}
          description={
            isMine && kind === 'following'
              ? 'Toque no nome de quem avalia para ver o perfil e seguir.'
              : undefined
          }
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.xs },
});
