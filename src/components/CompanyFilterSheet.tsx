import { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { colors, icon, radius, size, space, type } from '../theme';
import type { Company } from '../types';
import { matchesSearch } from '../utils/search';
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
  const insets = useSafeAreaInsets();
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.scrim}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fechar filtro"
        />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + space.md }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Filtrar por empresa</Text>
            <Pressable
              onPress={onClose}
              hitSlop={space.sm}
              accessibilityRole="button"
              accessibilityLabel="Fechar filtro"
            >
              <X size={icon.size.lg} color={colors.ink} strokeWidth={icon.strokeWidth} />
            </Pressable>
          </View>

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
            ListEmptyComponent={
              <Text style={styles.empty}>Nenhuma empresa com esse nome.</Text>
            }
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
          />

          <View style={styles.footer}>
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
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: colors.scrim },
  sheet: {
    maxHeight: size.sheetMaxHeight,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    backgroundColor: colors.bg,
  },
  handle: {
    alignSelf: 'center',
    width: size.sheetHandle.width,
    height: size.sheetHandle.height,
    marginTop: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: space.md,
  },
  title: {
    fontFamily: type.title.family,
    fontSize: type.title.size,
    lineHeight: type.title.lineHeight,
    color: colors.ink,
  },
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
  footer: {
    flexDirection: 'row',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerButton: { flex: 1 },
});
