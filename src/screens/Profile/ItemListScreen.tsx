import { useLayoutEffect } from 'react';
import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { EmptyState, ProductCard } from '../../components';
import { colors, space } from '../../theme';
import { products } from '../../mocks';
import { togglePurchased, toggleSaved, useUserItems } from '../../store/userItems';
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
  const items = useUserItems();
  const { kind } = route.params;
  const copy = COPY[kind];

  useLayoutEffect(() => {
    navigation.setOptions({ title: copy.title });
  }, [navigation, copy.title]);

  const ids = kind === 'saved' ? items.savedIds : items.purchasedIds;
  const list = products.filter((p) => ids.includes(p.id));
  const cardWidth = Math.floor((screenWidth - space.lg * 2 - space.md * (COLUMNS - 1)) / COLUMNS);

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={list}
      numColumns={COLUMNS}
      keyExtractor={(p) => p.id}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          width={cardWidth}
          onAvaliar={() => navigation.navigate('CreateReview', { productId: item.id })}
          onSecondary={() => navigation.navigate('ProductDetails', { productId: item.id })}
          saved={items.savedIds.includes(item.id)}
          purchased={items.purchasedIds.includes(item.id)}
          onToggleSaved={() => toggleSaved(item.id)}
          onTogglePurchased={() => togglePurchased(item.id)}
        />
      )}
      ListEmptyComponent={
        <View>
          <EmptyState compact title={copy.emptyTitle} description={copy.emptyDescription} />
        </View>
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: space.xxl },
  row: { gap: space.md, marginBottom: space.md },
});
