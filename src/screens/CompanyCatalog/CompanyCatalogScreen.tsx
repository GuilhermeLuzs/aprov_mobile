import { useState } from 'react';
import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import {
  CatalogFilterSheet,
  CompanyCard,
  EMPTY_CATALOG_FILTERS,
  EmptyState,
  FilterButton,
  Pagination,
  ProductCard,
  SearchBar,
  TopBar,
  countCatalogFilters,
  type CatalogFilters,
} from '../../components';
import { colors, space } from '../../theme';
import { companies } from '../../mocks';
import { useProductsWithStats } from '../../store/publishedReviews';
import type { Category, Product } from '../../types';
import type { HomeStackNavigation, HomeStackParamList } from '../../navigation/types';
import { matchesSearch } from '../../utils/search';
import { togglePurchased, toggleSaved, useUserItems } from '../../store/userItems';

const PAGE_SIZE = 20;
const COLUMNS = 2;

function byRating(a: Product, b: Product): number {
  return b.averageRating - a.averageRating || b.reviewCount - a.reviewCount;
}

export default function CompanyCatalogScreen() {
  const route = useRoute<RouteProp<HomeStackParamList, 'CompanyCatalog'>>();
  const navigation = useNavigation<HomeStackNavigation<'CompanyCatalog'>>();
  const { width: screenWidth } = useWindowDimensions();
  const { companyId } = route.params;

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_CATALOG_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const items = useUserItems();

  const company = companies.find((c) => c.id === companyId);
  const products = useProductsWithStats();
  const companyProducts = products.filter((p) => p.companyId === companyId);

  const availableCategories = companyProducts.reduce<Category[]>(
    (acc, p) => (acc.includes(p.category) ? acc : [...acc, p.category]),
    [],
  );

  const filtered = companyProducts
    .filter((p) => matchesSearch(p.title, query))
    .filter((p) => filters.kinds.length === 0 || filters.kinds.includes(p.kind))
    .filter((p) => filters.categories.length === 0 || filters.categories.includes(p.category))
    .sort(byRating);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const cardWidth = Math.floor((screenWidth - space.lg * 2 - space.md * (COLUMNS - 1)) / COLUMNS);
  const activeFilterCount = countCatalogFilters(filters);

  const changeQuery = (text: string) => {
    setPage(1);
    setQuery(text);
  };

  const applyFilters = (next: CatalogFilters) => {
    setPage(1);
    setFilters(next);
  };

  const clearAll = () => {
    setPage(1);
    setQuery('');
    setFilters(EMPTY_CATALOG_FILTERS);
  };

  if (!company) {
    return (
      <View style={styles.notFound}>
        <EmptyState
          title="Empresa não encontrada"
          description="Ela pode ter saído da plataforma."
          action={{ label: 'Voltar', onPress: () => navigation.goBack() }}
        />
      </View>
    );
  }

  const searching = query.trim() !== '';
  const filtering = searching || activeFilterCount > 0;

  return (
    <View style={styles.screen}>
      <TopBar onBack={() => navigation.goBack()}>
        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <SearchBar
              placeholder="Buscar no catálogo"
              value={query}
              onChangeText={changeQuery}
            />
          </View>
          <FilterButton
            activeCount={activeFilterCount}
            onPress={() => setFilterOpen(true)}
            accessibilityLabel="Filtrar catálogo"
          />
        </View>
      </TopBar>
      <FlatList
        style={styles.list}
        data={pageItems}
        numColumns={COLUMNS}
        keyExtractor={(p) => p.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.companyHeader}>
            <CompanyCard company={company} />
          </View>
        }
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
          filtering ? (
            <EmptyState
              title={searching ? `Nada encontrado para "${query.trim()}"` : 'Nada com esses filtros'}
              description="Confira a escrita ou tire um filtro."
              action={{ label: 'Limpar busca e filtros', onPress: clearAll }}
            />
          ) : (
            <EmptyState
              title="Catálogo vazio por enquanto"
              description="Esta empresa ainda não cadastrou produtos nem serviços."
            />
          )
        }
        ListFooterComponent={
          pageCount > 1 ? (
            <View style={styles.pagination}>
              <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
            </View>
          ) : null
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />

      <CatalogFilterSheet
        visible={filterOpen}
        availableCategories={availableCategories}
        filters={filters}
        onApply={applyFilters}
        onClose={() => setFilterOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { flex: 1 },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    padding: space.lg,
    backgroundColor: colors.bg,
  },
  content: { padding: space.lg, paddingBottom: space.xxl },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  searchField: { flex: 1 },
  companyHeader: { marginBottom: space.lg },
  row: { gap: space.md, marginBottom: space.md },
  pagination: { marginTop: space.lg },
});
