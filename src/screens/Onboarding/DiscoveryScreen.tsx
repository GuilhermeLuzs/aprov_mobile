import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, SelectableCard, Stepper } from '../../components';
import { colors, space, type } from '../../theme';
import type { OnboardingStackParamList } from '../../navigation/types';
import { ONBOARDING_STEPS, useLeaveOnboarding, useOnboarding } from './OnboardingContext';
import { DISCOVERY_OPTIONS } from './options';
import { OnboardingTopBar } from './OnboardingTopBar';

export default function DiscoveryScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<OnboardingStackParamList, 'Discovery'>>();
  const { discovery, setDiscovery } = useOnboarding();
  const leave = useLeaveOnboarding();

  return (
    <View style={styles.screen}>
      <OnboardingTopBar onBack={() => navigation.goBack()} onSkip={leave} />

      <ScrollView contentContainerStyle={styles.content}>
        <Stepper current={3} total={ONBOARDING_STEPS} />

        <Text style={styles.title}>Como conheceu a APROV?</Text>

        <View style={styles.options}>
          {DISCOVERY_OPTIONS.map((option) => (
            <SelectableCard
              key={option.key}
              mode="radio"
              indicatorPosition="leading"
              selected={discovery === option.key}
              onPress={() => setDiscovery(option.key)}
              accessibilityLabel={option.label}
            >
              <Text style={styles.optionLabel}>{option.label}</Text>
            </SelectableCard>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <Button
          label="Continuar"
          fullWidth
          disabled={discovery === null}
          onPress={() => navigation.navigate('Ready')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
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
  options: {
    marginTop: space.lg,
    gap: space.md,
  },
  optionLabel: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.ink,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
  },
});
