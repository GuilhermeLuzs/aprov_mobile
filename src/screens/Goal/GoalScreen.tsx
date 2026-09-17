import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, SelectableCard, Stepper } from '../../components';
import { colors, space, type } from '../../theme';
import type { OnboardingStackParamList } from '../../navigation/types';
import { useLeaveOnboarding, useOnboarding } from '../Onboarding/OnboardingContext';
import { GOAL_OPTIONS as GOALS } from '../Onboarding/options';

export default function GoalScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<OnboardingStackParamList, 'Goal'>>();
  const { goal, setGoal } = useOnboarding();
  const leave = useLeaveOnboarding();

  return (
    <View style={styles.screen}>
      <View style={[styles.skipRow, { paddingTop: insets.top + space.xs }]}>
        <Button variant="text" label="Pular" onPress={leave} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Stepper current={3} total={3} />

        <Text style={styles.title}>O que te traz aqui?</Text>

        <View style={styles.options}>
          {GOALS.map((option) => (
            <SelectableCard
              key={option.key}
              mode="radio"
              indicatorPosition="leading"
              selected={goal === option.key}
              onPress={() => setGoal(option.key)}
              accessibilityLabel={`${option.title}. ${option.description}`}
            >
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </SelectableCard>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <Button
          label="Continuar"
          fullWidth
          disabled={goal === null}
          onPress={() => navigation.navigate('NotificationsPermission')}
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
  options: {
    marginTop: space.lg,
    gap: space.md,
  },
  optionTitle: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.ink,
  },
  optionDescription: {
    marginTop: space.xs,
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
  },
});
