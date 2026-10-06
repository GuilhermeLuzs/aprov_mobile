import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, space, type } from '../theme';
import { CATEGORY_LABEL, type Category, type ProductKind } from '../types';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Chip } from './Chip';

export type CatalogFilters = { kinds: ProductKind[]; categories: Category[] };

export const EMPTY_CATALOG_FILTERS: CatalogFilters = { kinds: [], categories: [] };

const KIND_OPTIONS: { key: ProductKind; label: string }[] = [
  { key: 'product', label: 'Produto' },
  { key: 'service', label: 'Serviço' },
];

type Props = {
  visible: boolean;
  availableCategories: Category[];
  filters: CatalogFilters;
  onApply: (filters: CatalogFilters) => void;
  onClose: () => void;
};

function toggled<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function countCatalogFilters(filters: CatalogFilters): number {
  return filters.kinds.length + filters.categories.length;
}

export function CatalogFilterSheet({
  visible,
  availableCategories,
  filters,
  onApply,
  onClose,
}: Props) {
  const [draft, setDraft] = useState<CatalogFilters>(filters);

  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  const count = countCatalogFilters(draft);

  const apply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      title="Filtrar catálogo"
      closeLabel="Fechar filtro"
      onClose={onClose}
      footer={
        <>
          <Button
            label="Limpar"
            variant="secondary"
            disabled={count === 0}
            onPress={() => setDraft(EMPTY_CATALOG_FILTERS)}
            style={styles.footerButton}
          />
          <Button
            label={count > 0 ? `Aplicar (${count})` : 'Aplicar'}
            onPress={apply}
            style={styles.footerButton}
          />
        </>
      }
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Tipo</Text>
        <View style={styles.chips}>
          {KIND_OPTIONS.map((option) => (
            <Chip
              key={option.key}
              label={option.label}
              selected={draft.kinds.includes(option.key)}
              onPress={() => setDraft((d) => ({ ...d, kinds: toggled(d.kinds, option.key) }))}
            />
          ))}
        </View>

        {availableCategories.length >= 2 ? (
          <>
            <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Categoria</Text>
            <View style={styles.chips}>
              {availableCategories.map((category) => (
                <Chip
                  key={category}
                  label={CATEGORY_LABEL[category]}
                  selected={draft.categories.includes(category)}
                  onPress={() =>
                    setDraft((d) => ({ ...d, categories: toggled(d.categories, category) }))
                  }
                />
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg },
  sectionTitle: {
    marginBottom: space.sm,
    fontFamily: type.subtitle.family,
    fontSize: type.subtitle.size,
    lineHeight: type.subtitle.lineHeight,
    color: colors.ink,
  },
  sectionSpacing: { marginTop: space.xl },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  footerButton: { flex: 1 },
});
