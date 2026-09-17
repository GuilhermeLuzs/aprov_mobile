import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, MauricioMascot } from '../../components';
import { colors, space, type } from '../../theme';
import { setPreferences } from '../../store/preferences';
import { useLeaveOnboarding, useOnboarding } from '../Onboarding/OnboardingContext';

export default function NotificationsPermissionScreen() {
  const insets = useSafeAreaInsets();
  const leave = useLeaveOnboarding();
  const { categories, companyIds, goal } = useOnboarding();

  const finish = (notifications: boolean) => {
    setPreferences({ categories, companyIds, goal, notifications });
    leave();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.hero}>
        <MauricioMascot size={124} />
        <Text style={styles.title}>Te aviso quando cair a recompensa</Text>
        <Text style={styles.body}>
          Avisamos assim que sua avaliação for aprovada e as moedas entrarem.
        </Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <Button
          label="Ativar notificações"
          tone="onBrand"
          fullWidth
          onPress={() => finish(true)}
        />
        <Button
          label="Agora não"
          variant="text"
          tone="onBrand"
          fullWidth
          onPress={() => finish(false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.primaryBright,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  title: {
    marginTop: space.xl,
    fontFamily: type.display.family,
    fontSize: type.display.size,
    lineHeight: type.display.lineHeight,
    color: colors.surface,
    textAlign: 'center',
  },
  body: {
    marginTop: space.md,
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.valueDim,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.sm,
  },
});
