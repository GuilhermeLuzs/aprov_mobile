import { useLayoutEffect } from 'react';
import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { EmptyState, LoadError, LoadingState, ProductCard } from '../../components';
import { colors, space } from '../../theme';
import { togglePurchased, toggleSaved, useMyItems } from '../../queries/catalog';
import type {
  ItemListKind,
  ProfileStackNavigation,
  ProfileStackParamList,
} from '../../navigation/types';

const COLUMNS = 2;

const COPY: Record<ItemListKind, { title: string; emptyTitle: string; emptyDescription: string }> = {
  saved: {
    title: 'Itens salvos',
    emptyTitle: 'Nada salvo ainda',
    emptyDescription: 'Toque no marcador de um item para guardar aqui.',
  },
  purchased: {
    title: 'Itens comprados',
    emptyTitle: 'Nenhum item marcado',
    emptyDescription: 'Toque no recibo de um item para marcar que comprou ou contratou.',
  },
};

export default function ItemListScreen() {
  const route = useRoute<RouteProp<ProfileStackParamList, 'ItemList'>>();
  const navigation = useNavigation<ProfileStackNavigation<'ItemList'>>();
  const { width: screenWidth } = useWindowDimensions();
  const { kind } = route.params;
  const items = useMyItems(kind);
  const copy = COPY[kind];

  useLayoutEffect(() => {
    navigation.setOptions({ title: copy.title });
  }, [navigation, copy.title]);

  const cardWidth = Math.floor((screenWidth - space.lg * 2 - space.md * (COLUMNS - 1)) / COLUMNS);

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={items.data?.products ?? []}
      numColumns={COLUMNS}
      keyExtractor={(p) => p.id}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          width={cardWidth}
          onAvaliar={() => navigation.navigate('CreateReview', { productId: item.id })}
          onSecondary={() => navigation.navigate('ProductDetails', { productId: item.id })}
          saved={item.savedByCurrentUser}
          purchased={item.purchasedByCurrentUser}
          onToggleSaved={() => toggleSaved(item)}
          onTogglePurchased={() => togglePurchased(item)}
        />
      )}
      ListEmptyComponent={
        <View>
          {items.isPending ? (
            <LoadingState />
          ) : items.isError ? (
            <LoadError compact onRetry={() => void items.refetch()} />
          ) : (
            <EmptyState compact title={copy.emptyTitle} description={copy.emptyDescription} />
          )}
        </View>
      }
      ListFooterComponent={items.isFetchingNextPage ? <LoadingState /> : null}
      onEndReached={() => {
        if (items.hasNextPage && !items.isFetchingNextPage) void items.fetchNextPage();
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: space.xxl },
  row: { gap: space.md, marginBottom: space.md },
});
