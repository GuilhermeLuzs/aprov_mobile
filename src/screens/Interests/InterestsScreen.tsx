import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Chip, MauricioBubble, Stepper } from '../../components';
import { colors, radius, space, type } from '../../theme';
import { CATEGORY_LABEL } from '../../types';
import type { OnboardingStackParamList } from '../../navigation/types';
import {
  MIN_CATEGORIES,
  useLeaveOnboarding,
  useOnboarding,
} from '../Onboarding/OnboardingContext';
import { CATEGORY_ICON, CATEGORY_ORDER } from '../Onboarding/options';

export default function InterestsScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<OnboardingStackParamList, 'Interests'>>();
  const { categories, toggleCategory } = useOnboarding();
  const leave = useLeaveOnboarding();

  const remaining = MIN_CATEGORIES - categories.length;
  const canContinue = remaining <= 0;

  return (
    <View style={styles.screen}>
      <View style={[styles.skipRow, { paddingTop: insets.top + space.xs }]}>
        <Button variant="text" label="Pular" onPress={leave} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.band}>
          <MauricioBubble text="Oi, eu sou o Maurício. Me conta o que te interessa que eu monto o seu APROV." />
        </View>

        <Stepper current={1} total={3} />

        <Text style={styles.title}>O que te interessa?</Text>

        <View style={styles.chips}>
          {CATEGORY_ORDER.map((category) => (
            <Chip
              key={category}
              label={CATEGORY_LABEL[category]}
              icon={CATEGORY_ICON[category]}
              selected={categories.includes(category)}
              onPress={() => toggleCategory(category)}
            />
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + space.md },
        ]}
      >
        {!canContinue ? (
          <Text style={styles.counter}>{`selecione mais ${remaining}`}</Text>
        ) : null}
        <Button
          label="Continuar"
          fullWidth
          disabled={!canContinue}
          onPress={() => navigation.navigate('Companies')}
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
    paddingBottom: space.xl,
  },
  band: {
    backgroundColor: colors.primaryBright,
    borderRadius: radius.card,
    padding: space.lg,
    marginBottom: space.xl,
  },
  title: {
    marginTop: space.xl,
    fontFamily: type.title.family,
    fontSize: type.title.size,
    lineHeight: type.title.lineHeight,
    color: colors.ink,
  },
  chips: {
    marginTop: space.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
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
