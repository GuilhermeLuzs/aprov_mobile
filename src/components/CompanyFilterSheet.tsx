import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { colors, space, type } from '../theme';
import type { Company } from '../types';
import { matchesSearch } from '../utils/search';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { CompanyCard } from './CompanyCard';
import { SearchBar } from './SearchBar';

type Props = {
  visible: boolean;
  companies: Company[];
  selectedIds: string[];
  onApply: (ids: string[]) => void;
  onClose: () => void;
};

export function CompanyFilterSheet({ visible, companies, selectedIds, onApply, onClose }: Props) {
  const [draft, setDraft] = useState<string[]>(selectedIds);
  const [pinnedIds, setPinnedIds] = useState<string[]>(selectedIds);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (visible) {
      setDraft(selectedIds);
      setPinnedIds(selectedIds);
      setQuery('');
    }
  }, [visible, selectedIds]);

  const pinnedFirst = [
    ...companies.filter((c) => pinnedIds.includes(c.id)),
    ...companies.filter((c) => !pinnedIds.includes(c.id)),
  ];
  const visibleCompanies = pinnedFirst.filter((c) => matchesSearch(c.name, query));

  const toggle = (id: string) =>
    setDraft((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const apply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      title="Filtrar por empresa"
      closeLabel="Fechar filtro"
      onClose={onClose}
      footer={
        <>
          <Button
            label="Limpar"
            variant="secondary"
            disabled={draft.length === 0}
            onPress={() => setDraft([])}
            style={styles.footerButton}
          />
          <Button
            label={draft.length > 0 ? `Aplicar (${draft.length})` : 'Aplicar'}
            onPress={apply}
            style={styles.footerButton}
          />
        </>
      }
    >
      <View style={styles.search}>
        <SearchBar placeholder="Buscar empresa" value={query} onChangeText={setQuery} />
      </View>

      <FlatList
        data={visibleCompanies}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <CompanyCard
            company={item}
            selected={draft.includes(item.id)}
            onPress={() => toggle(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma empresa com esse nome.</Text>}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  search: { paddingHorizontal: space.lg, paddingTop: space.md },
  list: { padding: space.lg },
  separator: { height: space.sm },
  empty: {
    textAlign: 'center',
    paddingVertical: space.xl,
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
  footerButton: { flex: 1 },
});
