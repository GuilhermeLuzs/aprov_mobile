import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, MauricioMascot } from '../../components';
import { colors, space, type } from '../../theme';
import { setPreferences } from '../../store/preferences';
import { useLeaveOnboarding, useOnboarding } from './OnboardingContext';

export default function ReadyScreen() {
  const insets = useSafeAreaInsets();
  const leave = useLeaveOnboarding();
  const { categories, companyIds, goal } = useOnboarding();

  const finish = () => {
    setPreferences({ categories, companyIds, goal });
    leave();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.hero}>
        <MauricioMascot size={124} />
        <Text style={styles.title}>Tudo pronto</Text>
        <Text style={styles.body}>
          Agora é só avaliar o que você usou e ganhar moedas, pontos e XP.
        </Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <Button label="Começar" tone="onBrand" fullWidth onPress={finish} />
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
  },
});
