import { FlatList, StyleSheet } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { EmptyState, LoadError, LoadingState, PersonRow } from '../../components';
import { colors, space } from '../../theme';
import { useFollowList, useProfile } from '../../queries/people';
import { useCurrentUser } from '../../store/session';
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
  const openProfile = useOpenProfile();
  const list = useFollowList(userId, kind);
  const owner = useProfile(userId).data?.user;

  const isMine = userId === me.id;
  const ownerName = isMine ? null : owner?.name.split(' ')[0] ?? null;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={list.people}
      keyExtractor={(person) => person.user.id}
      renderItem={({ item }) => (
        <PersonRow user={item.user.id === me.id ? me : item.user} onPress={() => openProfile(item.user.id)} />
      )}
      ListEmptyComponent={
        list.isPending ? (
          <LoadingState />
        ) : list.isError ? (
          <LoadError compact onRetry={() => void list.refetch()} />
        ) : (
          <EmptyState
            compact
            title={emptyTitle(kind, ownerName)}
            description={
              isMine && kind === 'following'
                ? 'Toque no nome de quem avalia para ver o perfil e seguir.'
                : undefined
            }
          />
        )
      }
      ListFooterComponent={list.isFetchingNextPage ? <LoadingState /> : null}
      onEndReached={() => {
        if (list.hasNextPage && !list.isFetchingNextPage) void list.fetchNextPage();
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.xs },
});
