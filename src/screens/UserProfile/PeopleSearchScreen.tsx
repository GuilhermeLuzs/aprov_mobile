import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  EmptyState,
  LoadError,
  LoadingState,
  PersonRow,
  SearchBar,
  SectionHeader,
  TopBar,
} from '../../components';
import { colors, space } from '../../theme';
import { usePeople, type Person } from '../../queries/people';
import { formatInt } from '../../utils/format';
import { useDebouncedValue } from '../../utils/useDebouncedValue';
import type { PeopleNavigation } from '../../navigation/types';
import { useOpenProfile } from './useOpenProfile';

const SEARCH_DELAY_MS = 300;

function followersLabel(person: Person): string {
  const count = person.followerCount;
  return `${formatInt(count)} ${count === 1 ? 'seguidor' : 'seguidores'}`;
}

export default function PeopleSearchScreen() {
  const navigation = useNavigation<PeopleNavigation<'UserProfile'>>();
  const openProfile = useOpenProfile();
  const [query, setQuery] = useState('');
  const search = useDebouncedValue(query.trim(), SEARCH_DELAY_MS);
  const people = usePeople(search);

  const searching = query.trim() !== '';

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
        data={people.people}
        keyExtractor={(person) => person.user.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListHeaderComponent={searching ? null : <SectionHeader title="Sugestões para seguir" />}
        renderItem={({ item }) => (
          <PersonRow
            user={item.user}
            detail={followersLabel(item)}
            onPress={() => openProfile(item.user.id)}
          />
        )}
        ListEmptyComponent={
          people.isPending ? (
            <LoadingState />
          ) : people.isError ? (
            <LoadError compact onRetry={() => void people.refetch()} />
          ) : searching ? (
            <EmptyState
              compact
              mood="confused"
              title="Ninguém encontrado"
              description="Confira o nome ou o @ e tente de novo."
            />
          ) : (
            <EmptyState compact title="Você já segue todo mundo por aqui" />
          )
        }
        ListFooterComponent={people.isFetchingNextPage ? <LoadingState /> : null}
        onEndReached={() => {
          if (people.hasNextPage && !people.isFetchingNextPage) void people.fetchNextPage();
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.xs },
});
