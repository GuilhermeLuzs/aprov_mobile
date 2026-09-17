import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, CompanyCard, Stepper } from '../../components';
import { colors, space, type } from '../../theme';
import { companies } from '../../mocks';
import type { OnboardingStackParamList } from '../../navigation/types';
import {
  MIN_COMPANIES,
  useLeaveOnboarding,
  useOnboarding,
} from '../Onboarding/OnboardingContext';

export default function CompaniesScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<OnboardingStackParamList, 'Companies'>>();
  const { categories, companyIds, toggleCompany } = useOnboarding();
  const leave = useLeaveOnboarding();
  const [showAll, setShowAll] = useState(false);

  const effectiveShowAll = showAll || categories.length === 0;

  const list = useMemo(() => {
    if (effectiveShowAll) return companies;
    return companies.filter((c) => c.categories.some((cat) => categories.includes(cat)));
  }, [categories, effectiveShowAll]);

  const selectedCount = companyIds.length;
  const remaining = MIN_COMPANIES - selectedCount;
  const canContinue = remaining <= 0;

  return (
    <View style={styles.screen}>
      <View style={[styles.skipRow, { paddingTop: insets.top + space.xs }]}>
        <Button variant="text" label="Pular" onPress={leave} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Stepper current={2} total={3} />

        <Text style={styles.title}>Quem você quer acompanhar?</Text>
        <Text style={styles.support}>
          {effectiveShowAll
            ? 'todas as empresas parceiras'
            : 'empresas nas áreas que você escolheu'}
        </Text>

        {list.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Nenhuma empresa parceira nas áreas que você escolheu ainda.
            </Text>
            <Button
              variant="secondary"
              label="Ver todas as empresas"
              onPress={() => setShowAll(true)}
            />
          </View>
        ) : (
          <View style={styles.cards}>
            {list.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                selected={companyIds.includes(company.id)}
                onPress={() => toggleCompany(company.id)}
              />
            ))}
          </View>
        )}

        {!effectiveShowAll && list.length > 0 ? (
          <View style={styles.exploreRow}>
            <Button variant="text" label="explorar todas" onPress={() => setShowAll(true)} />
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        {!canContinue ? (
          <Text style={styles.counter}>{`selecione mais ${remaining}`}</Text>
        ) : null}
        <Button
          label="Continuar"
          fullWidth
          disabled={!canContinue}
          onPress={() => navigation.navigate('Goal')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  skipRow: {
    alignItems: 'flex-end',
    paddingHorizontal: space.sm,
  },
  content: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.xl,
  },
  title: {
    marginTop: space.lg,
    fontFamily: type.title.family,
    fontSize: type.title.size,
    lineHeight: type.title.lineHeight,
    color: colors.ink,
  },
  support: {
    marginTop: space.xs,
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  cards: {
    marginTop: space.lg,
    gap: space.md,
  },
  empty: {
    marginTop: space.xl,
    gap: space.md,
    alignItems: 'flex-start',
  },
  emptyText: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
  exploreRow: {
    marginTop: space.sm,
    alignItems: 'flex-start',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.sm,
  },
  counter: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
});
