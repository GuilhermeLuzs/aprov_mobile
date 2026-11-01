import { useState } from 'react';
import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { AccessoryCard, Pagination } from '../../components';
import { accessories } from '../../mocks';
import type { ShopStackParamList } from '../../navigation/types';
import { equipAccessory } from '../../store/accessories';
import { useCurrentUser } from '../../store/session';
import { colors, space } from '../../theme';
import { useAccessorySheet } from './useAccessorySheet';

const PAGE_SIZE = 20;
const COLUMNS = 2;

export default function AccessoryListScreen() {
  const route = useRoute<RouteProp<ShopStackParamList, 'AccessoryList'>>();
  const { kind } = route.params;
  const { width: screenWidth } = useWindowDimensions();
  const user = useCurrentUser();
  const { statusOf, openAccessory, sheet } = useAccessorySheet();
  const [page, setPage] = useState(1);

  const items = accessories.filter((c) => c.kind === kind);
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const cardWidth = Math.floor((screenWidth - space.lg * 2 - space.md * (COLUMNS - 1)) / COLUMNS);

  return (
    <View style={styles.screen}>
      <FlatList
        data={paged}
        keyExtractor={(c) => c.id}
        numColumns={COLUMNS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <AccessoryCard
            accessory={item}
            status={statusOf(item)}
            user={user}
            width={cardWidth}
            onPress={() => openAccessory(item.id)}
            onEquip={() => equipAccessory(item)}
          />
        )}
        ListFooterComponent={
          <View style={styles.pagination}>
            <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
      {sheet}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: space.xxl },
  row: { gap: space.md, marginBottom: space.md },
  pagination: { marginTop: space.lg },
});
