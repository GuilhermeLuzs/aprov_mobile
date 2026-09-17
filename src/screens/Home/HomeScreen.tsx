import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Chip,
  EmptyState,
  Pagination,
  ProductCard,
  SearchBar,
  SectionHeader,
} from '../../components';
import { colors, space } from '../../theme';
import { companies, products } from '../../mocks';
import type { Company, Product } from '../../types';

const COMPANIES_PER_PAGE = 5;
const PRODUCTS_PER_CAROUSEL = 6;
const CARD_WIDTH = 232;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const visibleCompanies =
    selectedCompanyIds.length === 0
      ? companies
      : companies.filter((c) => selectedCompanyIds.includes(c.id));

  const pageCount = Math.max(1, Math.ceil(visibleCompanies.length / COMPANIES_PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const pagedCompanies = visibleCompanies.slice(
    (safePage - 1) * COMPANIES_PER_PAGE,
    safePage * COMPANIES_PER_PAGE,
  );

  const topProducts = (companyId: string): Product[] =>
    products
      .filter((p) => p.companyId === companyId)
      .sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount)
      .slice(0, PRODUCTS_PER_CAROUSEL);

  const toggleCompany = (id: string) => {
    setPage(1);
    setSelectedCompanyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const header = (
    <View>
      <View style={styles.gutter}>
        <SearchBar placeholder="Buscar empresas e produtos" />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {companies.map((c) => (
          <Chip
            key={c.id}
            label={c.name}
            selected={selectedCompanyIds.includes(c.id)}
            onPress={() => toggleCompany(c.id)}
            style={styles.filterChip}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <FlatList
      style={styles.screen}
      data={pagedCompanies}
      keyExtractor={(c) => c.id}
      renderItem={({ item }) => (
        <CompanyCarousel company={item} products={topProducts(item.id)} />
      )}
      ListHeaderComponent={header}
      ListFooterComponent={
        <View style={styles.pagination}>
          <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
        </View>
      }
      ListEmptyComponent={
        <View style={[styles.gutter, styles.carousel]}>
          <EmptyState
            title="Nada por aqui com esse filtro"
            description="Tire uma empresa da seleção para ver mais."
            action={{ label: 'Limpar filtro', onPress: () => setSelectedCompanyIds([]) }}
          />
        </View>
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top + space.md, paddingBottom: space.xxl }}
    />
  );
}

function CompanyCarousel({
  company,
  products: items,
}: {
  company: Company;
  products: Product[];
}) {
  return (
    <View style={styles.carousel}>
      <View style={styles.gutter}>
        <SectionHeader title={company.name} />
      </View>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(p) => p.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
        snapToInterval={CARD_WIDTH + space.md}
        decelerationRate="fast"
        renderItem={({ item }) => <ProductCard product={item} width={CARD_WIDTH} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  gutter: { paddingHorizontal: space.lg },
  filterRow: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.sm,
  },
  filterChip: { maxWidth: 200 },
  carousel: { marginTop: space.xl },
  rail: {
    paddingHorizontal: space.lg,
    gap: space.md,
  },
  pagination: { marginTop: space.xl },
});
