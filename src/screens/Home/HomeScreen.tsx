import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  BrandMark,
  CompanyFilterSheet,
  EmptyState,
  FilterButton,
  LoadError,
  LoadingState,
  Pagination,
  ProductCard,
  SearchBar,
  SectionHeader,
  TopBar,
} from '../../components';
import { colors, space } from '../../theme';
import type { Company, Product } from '../../types';
import type { HomeStackNavigation } from '../../navigation/types';
import { togglePurchased, toggleSaved, useCompanies, useHome } from '../../queries/catalog';
import { useDebouncedValue } from '../../utils/useDebouncedValue';

const CARD_WIDTH = 232;
const SEARCH_DELAY_MS = 300;

export default function HomeScreen() {
  const navigation = useNavigation<HomeStackNavigation<'Home'>>();
  const [query, setQuery] = useState('');
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const search = useDebouncedValue(query.trim(), SEARCH_DELAY_MS);
  const home = useHome({ page, search, companyIds: selectedCompanyIds });
  const companies = useCompanies(filterOpen);

  const rows = home.data?.rows ?? [];
  const pageCount = home.data?.pageCount ?? 1;
  const currentPage = home.data?.page ?? page;

  const changeQuery = (text: string) => {
    setPage(1);
    setQuery(text);
  };

  const applyCompanies = (ids: string[]) => {
    setPage(1);
    setSelectedCompanyIds(ids);
  };

  const clearAll = () => {
    setPage(1);
    setQuery('');
    setSelectedCompanyIds([]);
  };

  const searching = query.trim() !== '';

  return (
    <View style={styles.screen}>
      <TopBar style={styles.searchRow}>
        <BrandMark />
        <View style={styles.searchField}>
          <SearchBar
            placeholder="Buscar empresas e produtos"
            value={query}
            onChangeText={changeQuery}
          />
        </View>
        <FilterButton
          activeCount={selectedCompanyIds.length}
          onPress={() => setFilterOpen(true)}
          accessibilityLabel="Filtrar por empresa"
        />
      </TopBar>
      <FlatList
        style={styles.list}
        data={rows}
        keyExtractor={(row) => row.company.id}
        renderItem={({ item }) => (
          <CompanyCarousel
            company={item.company}
            products={item.products}
            onSeeAll={() => navigation.navigate('CompanyCatalog', { companyId: item.company.id })}
            onReview={(productId) => navigation.navigate('CreateReview', { productId })}
            onDetails={(productId) => navigation.navigate('ProductDetails', { productId })}
          />
        )}
        ListFooterComponent={
          rows.length > 0 ? (
            <View style={styles.pagination}>
              <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          home.isPending ? (
            <LoadingState />
          ) : home.isError ? (
            <View style={[styles.gutter, styles.carousel]}>
              <LoadError onRetry={() => void home.refetch()} />
            </View>
          ) : (
            <View style={[styles.gutter, styles.carousel]}>
              <EmptyState
                mood={searching ? 'confused' : 'neutral'}
                title={searching ? `Nada encontrado para "${query.trim()}"` : 'Nada por aqui com esse filtro'}
                description={
                  searching
                    ? 'Confira a escrita ou busque por outro nome.'
                    : 'Tire uma empresa da seleção para ver mais.'
                }
                action={{ label: 'Limpar busca e filtro', onPress: clearAll }}
              />
            </View>
          )
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      />

      <CompanyFilterSheet
        visible={filterOpen}
        companies={companies.data ?? []}
        selectedIds={selectedCompanyIds}
        onApply={applyCompanies}
        onClose={() => setFilterOpen(false)}
      />
    </View>
  );
}

function CompanyCarousel({
  company,
  products: items,
  onSeeAll,
  onReview,
  onDetails,
}: {
  company: Company;
  products: Product[];
  onSeeAll: () => void;
  onReview: (productId: string) => void;
  onDetails: (productId: string) => void;
}) {
  return (
    <View style={styles.carousel}>
      <View style={styles.gutter}>
        <SectionHeader title={company.name} action={{ label: 'Ver mais', onPress: onSeeAll }} />
      </View>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(p) => p.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
        snapToInterval={CARD_WIDTH + space.md}
        decelerationRate="fast"
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            width={CARD_WIDTH}
            onAvaliar={() => onReview(item.id)}
            onSecondary={() => onDetails(item.id)}
            saved={item.savedByCurrentUser}
            purchased={item.purchasedByCurrentUser}
            onToggleSaved={() => toggleSaved(item)}
            onTogglePurchased={() => togglePurchased(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { flex: 1 },
  content: { paddingBottom: space.xxl },
  gutter: { paddingHorizontal: space.lg },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingBottom: space.sm,
  },
  searchField: { flex: 1 },
  carousel: { marginTop: space.xl },
  rail: {
    paddingHorizontal: space.lg,
    gap: space.md,
  },
  pagination: { marginTop: space.xl },
});
