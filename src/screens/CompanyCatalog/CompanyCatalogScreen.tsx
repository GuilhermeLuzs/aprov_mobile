import { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import {
  CatalogFilterSheet,
  EMPTY_CATALOG_FILTERS,
  EmptyState,
  FilterButton,
  LoadError,
  LoadingState,
  Pagination,
  ProductCard,
  SearchBar,
  TopBar,
  countCatalogFilters,
  type CatalogFilters,
} from '../../components';
import { colors, radius, size, space, type } from '../../theme';
import { ApiError } from '../../api';
import { togglePurchased, toggleSaved, useCompany, useCompanyItems } from '../../queries/catalog';
import type { HomeStackNavigation, HomeStackParamList } from '../../navigation/types';
import { useDebouncedValue } from '../../utils/useDebouncedValue';

const COLUMNS = 2;
const SEARCH_DELAY_MS = 300;
const NOT_FOUND = 404;

export default function CompanyCatalogScreen() {
  const route = useRoute<RouteProp<HomeStackParamList, 'CompanyCatalog'>>();
  const navigation = useNavigation<HomeStackNavigation<'CompanyCatalog'>>();
  const { width: screenWidth } = useWindowDimensions();
  const { companyId } = route.params;

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_CATALOG_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const search = useDebouncedValue(query.trim(), SEARCH_DELAY_MS);

  const companyQuery = useCompany(companyId);
  const itemsQuery = useCompanyItems(companyId, {
    page,
    search,
    kinds: filters.kinds,
    categories: filters.categories,
  });

  const company = companyQuery.data;
  const pageItems = itemsQuery.data?.products ?? [];
  const pageCount = itemsQuery.data?.pageCount ?? 1;
  const currentPage = itemsQuery.data?.page ?? page;

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

  if (companyQuery.isPending) return <LoadingState fill />;

  if (!company) {
    const missing = companyQuery.error instanceof ApiError && companyQuery.error.status === NOT_FOUND;
    return (
      <View style={styles.notFound}>
        {missing ? (
          <EmptyState
            mood="confused"
            title="Empresa não encontrada"
            description="Ela pode ter saído da plataforma."
            action={{ label: 'Voltar', onPress: () => navigation.goBack() }}
          />
        ) : (
          <LoadError onRetry={() => void companyQuery.refetch()} />
        )}
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
            <SearchBar placeholder="Buscar no catálogo" value={query} onChangeText={changeQuery} />
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
            <Image
              source={{ uri: company.logoUri }}
              style={styles.companyLogo}
              accessibilityIgnoresInvertColors
            />
            <Text style={styles.companyName} accessibilityRole="header">
              {company.name}
            </Text>
          </View>
        }
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
          itemsQuery.isPending ? (
            <LoadingState />
          ) : itemsQuery.isError ? (
            <LoadError onRetry={() => void itemsQuery.refetch()} />
          ) : filtering ? (
            <EmptyState
              mood={searching ? 'confused' : 'neutral'}
              title={
                searching ? `Nada encontrado para "${query.trim()}"` : 'Nada com esses filtros'
              }
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
              <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
            </View>
          ) : null
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />

      <CatalogFilterSheet
        visible={filterOpen}
        availableCategories={company.categories}
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
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginBottom: space.lg,
  },
  companyLogo: {
    width: size.companyLogo,
    height: size.companyLogo,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  companyName: {
    flex: 1,
    fontFamily: type.subtitle.family,
    fontSize: type.subtitle.size,
    lineHeight: type.subtitle.lineHeight,
    color: colors.ink,
  },
  row: { gap: space.md, marginBottom: space.md },
  pagination: { marginTop: space.lg },
});
