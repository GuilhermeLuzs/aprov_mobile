import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Chip, CompanyCard, SectionHeader } from '../../components';
import { colors, space, type } from '../../theme';
import { companies } from '../../mocks';
import { CATEGORY_LABEL, type Category } from '../../types';
import { getPreferences, setPreferences } from '../../store/preferences';
import type { ProfileStackNavigation } from '../../navigation/types';
import {
  CATEGORY_ICON,
  CATEGORY_ORDER,
  MIN_CATEGORIES,
  MIN_COMPANIES,
} from '../Onboarding/options';

function toggled<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function missingText(categories: number, companies: number): string | null {
  const parts = [
    categories > 0 ? `${categories} ${categories === 1 ? 'categoria' : 'categorias'}` : null,
    companies > 0 ? `${companies} ${companies === 1 ? 'empresa' : 'empresas'}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? `selecione mais ${parts.join(' e ')}` : null;
}

export default function EditInterestsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ProfileStackNavigation<'EditInterests'>>();
  const [initial] = useState(getPreferences);
  const [categories, setCategories] = useState<Category[]>(initial.categories);
  const [companyIds, setCompanyIds] = useState<string[]>(initial.companyIds);

  const [companyOrder] = useState(() => [
    ...companies.filter((c) => initial.companyIds.includes(c.id)),
    ...companies.filter((c) => !initial.companyIds.includes(c.id)),
  ]);

  const missing = missingText(
    Math.max(0, MIN_CATEGORIES - categories.length),
    Math.max(0, MIN_COMPANIES - companyIds.length),
  );

  const save = () => {
    setPreferences({ categories, companyIds });
    navigation.goBack();
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.support}>
          O Feed mostra primeiro as avaliações das categorias e empresas que você escolher.
        </Text>

        <View style={styles.group}>
          <SectionHeader title="Categorias" />
          <View style={styles.chips}>
            {CATEGORY_ORDER.map((category) => (
              <Chip
                key={category}
                label={CATEGORY_LABEL[category]}
                icon={CATEGORY_ICON[category]}
                selected={categories.includes(category)}
                onPress={() => setCategories((prev) => toggled(prev, category))}
              />
            ))}
          </View>
        </View>

        <View style={styles.group}>
          <SectionHeader title="Empresas" />
          <View style={styles.cards}>
            {companyOrder.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                selected={companyIds.includes(company.id)}
                onPress={() => setCompanyIds((prev) => toggled(prev, company.id))}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        {missing ? <Text style={styles.counter}>{missing}</Text> : null}
        <Button label="Salvar" fullWidth disabled={missing !== null} onPress={save} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.xl },
  support: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
  group: { gap: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  cards: { gap: space.sm },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  counter: {
    textAlign: 'center',
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
});
