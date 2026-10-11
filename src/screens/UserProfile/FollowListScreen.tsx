import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';
import { Avatar, EmptyState } from '../../components';
import { colors, icon, radius, size, space, type } from '../../theme';
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

function PersonRow({ user, onPress }: { user: User; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver perfil de ${user.name}`}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Avatar uri={user.avatarUri} name={user.name} size="md" />
      <View style={styles.rowText}>
        <Text style={styles.name} numberOfLines={1}>
          {user.name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {user.handle} · Nível {user.level}
        </Text>
      </View>
      <ChevronRight size={icon.size.md} color={colors.inkFaint} strokeWidth={icon.strokeWidth} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.xs },
  row: {
    minHeight: size.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
    borderRadius: radius.control,
  },
  rowPressed: { backgroundColor: colors.surfaceAlt },
  rowText: { flex: 1 },
  name: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.ink,
  },
  sub: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
});
