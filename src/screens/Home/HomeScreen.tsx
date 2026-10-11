import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  CompanyFilterSheet,
  EmptyState,
  FilterButton,
  Pagination,
  ProductCard,
  SearchBar,
  SectionHeader,
  TopBar,
} from '../../components';
import { colors, space } from '../../theme';
import { companies, products } from '../../mocks';
import type { Company, Product } from '../../types';
import type { HomeStackNavigation } from '../../navigation/types';
import { matchesSearch } from '../../utils/search';
import { togglePurchased, toggleSaved, useUserItems } from '../../store/userItems';

const COMPANIES_PER_PAGE = 5;
const PRODUCTS_PER_CAROUSEL = 6;
const CARD_WIDTH = 232;

type CompanyRow = { company: Company; products: Product[] };

function byRating(a: Product, b: Product): number {
  return b.averageRating - a.averageRating || b.reviewCount - a.reviewCount;
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeStackNavigation<'Home'>>();
  const [query, setQuery] = useState('');
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const rows: CompanyRow[] = companies
    .filter((c) => selectedCompanyIds.length === 0 || selectedCompanyIds.includes(c.id))
    .map((company) => {
      const own = products.filter((p) => p.companyId === company.id).sort(byRating);
      const shown = matchesSearch(company.name, query)
        ? own
        : own.filter((p) => matchesSearch(p.title, query));
      return { company, products: shown.slice(0, PRODUCTS_PER_CAROUSEL) };
    })
    .filter((row) => row.products.length > 0);

  const pageCount = Math.max(1, Math.ceil(rows.length / COMPANIES_PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const pagedRows = rows.slice((safePage - 1) * COMPANIES_PER_PAGE, safePage * COMPANIES_PER_PAGE);

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
        data={pagedRows}
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
              <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={[styles.gutter, styles.carousel]}>
            <EmptyState
              title={searching ? `Nada encontrado para "${query.trim()}"` : 'Nada por aqui com esse filtro'}
              description={
                searching
                  ? 'Confira a escrita ou busque por outro nome.'
                  : 'Tire uma empresa da seleção para ver mais.'
              }
              action={{ label: 'Limpar busca e filtro', onPress: clearAll }}
            />
          </View>
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      />

      <CompanyFilterSheet
        visible={filterOpen}
        companies={companies}
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
  const userItems = useUserItems();
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
            saved={userItems.savedIds.includes(item.id)}
            purchased={userItems.purchasedIds.includes(item.id)}
            onToggleSaved={() => toggleSaved(item.id)}
            onTogglePurchased={() => togglePurchased(item.id)}
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
