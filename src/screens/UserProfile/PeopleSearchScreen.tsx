import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { EmptyState, PersonRow, SearchBar, SectionHeader, TopBar } from '../../components';
import { colors, space } from '../../theme';
import type { Follow, User } from '../../types';
import { followersOf, followingOf, useFollows } from '../../store/follows';
import { allUsers, useCurrentUser } from '../../store/session';
import { formatInt } from '../../utils/format';
import { matchesSearch } from '../../utils/search';
import type { PeopleNavigation } from '../../navigation/types';
import { useOpenProfile } from './useOpenProfile';

function byFollowers(follows: Follow[]) {
  return (a: User, b: User) => followersOf(follows, b.id).length - followersOf(follows, a.id).length;
}

export default function PeopleSearchScreen() {
  const navigation = useNavigation<PeopleNavigation<'UserProfile'>>();
  const me = useCurrentUser();
  const follows = useFollows();
  const openProfile = useOpenProfile();
  const [query, setQuery] = useState('');

  const searching = query.trim() !== '';
  const others = allUsers().filter((u) => u.id !== me.id);
  const following = followingOf(follows, me.id);

  const people = searching
    ? others.filter((u) => matchesSearch(u.name, query) || matchesSearch(u.handle, query))
    : others.filter((u) => !following.includes(u.id));
  const sorted = [...people].sort(byFollowers(follows));

  const followersLabel = (user: User) => {
    const count = followersOf(follows, user.id).length;
    return `${formatInt(count)} ${count === 1 ? 'seguidor' : 'seguidores'}`;
  };

  return (
    <View style={styles.screen}>
      <TopBar onBack={() => navigation.goBack()}>
        <SearchBar
          placeholder="Buscar pelo nome ou pelo @"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </TopBar>

      <FlatList
        data={sorted}
        keyExtractor={(u) => u.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListHeaderComponent={searching ? null : <SectionHeader title="Sugestões para seguir" />}
        renderItem={({ item }) => (
          <PersonRow
            user={item}
            detail={followersLabel(item)}
            onPress={() => openProfile(item.id)}
          />
        )}
        ListEmptyComponent={
          searching ? (
            <EmptyState
              compact
              title="Ninguém encontrado"
              description="Confira o nome ou o @ e tente de novo."
            />
          ) : (
            <EmptyState compact title="Você já segue todo mundo por aqui" />
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.xs },
});
