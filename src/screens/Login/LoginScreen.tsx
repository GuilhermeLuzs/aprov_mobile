import { useEffect, useState } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BrandBackdrop,
  BrandLockup,
  Button,
  MauricioBubble,
  MauricioMascot,
  TextField,
} from '../../components';
import { colors, radius, size, space, type } from '../../theme';
import { signIn, type SignInResult } from '../../store/session';
import type { RootStackParamList } from '../../navigation/types';

const SIGN_IN_ERROR: Record<Exclude<SignInResult, 'ok'>, string> = {
  invalid: 'E-mail ou senha incorretos.',
  deactivated: 'Esta conta foi desativada.',
  'network-error': 'Não deu para conectar com a APROV. Confira a internet e tente de novo.',
};

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Login'>>();
  const [formOpen, setFormOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim() !== '' && password !== '' && !submitting;

  useEffect(() => {
    if (!formOpen) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setFormOpen(false);
      return true;
    });
    return () => subscription.remove();
  }, [formOpen]);

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result !== 'ok') {
      setError(SIGN_IN_ERROR[result]);
      return;
    }
    setError(null);
    setPassword('');
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  const openSignUp = () => navigation.navigate('SignUp');

  return (
    <BrandBackdrop style={styles.screen}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ paddingTop: insets.top + space.lg }}>
          <BrandLockup />
        </View>

        {formOpen ? (
          <View style={styles.greeting}>
            <MauricioBubble
              text="Que bom te ver de novo!"
              mascotSize={size.welcome.mascot.medium}
              skin="mauricio"
              outlined
            />
          </View>
        ) : (
          <View style={styles.stage}>
            <MauricioMascot size={size.welcome.mascot.large} mood="starry" skin="mauricio" outlined />
            <Text style={styles.tagline}>Avalie o que você usa, ganhe moedas e suba de nível.</Text>
          </View>
        )}

        {formOpen ? (
          <View style={[styles.sheet, { paddingBottom: insets.bottom + space.lg }]}>
            <ScrollView
              contentContainerStyle={styles.sheetContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Entrar</Text>
                <Button label="Voltar" variant="text" size="sm" onPress={() => setFormOpen(false)} />
              </View>
              <View style={styles.form}>
                <TextField
                  label="E-mail"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                  }}
                  placeholder="voce@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                />
                <TextField
                  label="Senha"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError(null);
                  }}
                  secure
                  autoCapitalize="none"
                  autoComplete="password"
                  returnKeyType="go"
                  onSubmitEditing={submit}
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
              </View>
              <Button
                label={submitting ? 'Entrando...' : 'Entrar'}
                fullWidth
                disabled={!canSubmit}
                onPress={submit}
              />
              <View style={styles.signUp}>
                <Text style={styles.signUpText}>Ainda não tem conta?</Text>
                <Button label="Criar conta" variant="text" onPress={openSignUp} />
              </View>
            </ScrollView>
          </View>
        ) : (
          <View style={[styles.actions, { paddingBottom: insets.bottom + space.xl }]}>
            <Button label="Entrar" tone="onBrand" fullWidth onPress={() => setFormOpen(true)} />
            <Button label="Criar conta" tone="onBrand" variant="secondary" fullWidth onPress={openSignUp} />
          </View>
        )}
      </KeyboardAvoidingView>
    </BrandBackdrop>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xl,
    paddingHorizontal: space.xl,
  },
  greeting: { flex: 1, justifyContent: 'center', paddingHorizontal: space.lg },
  tagline: {
    fontFamily: type.title.family,
    fontSize: type.title.size,
    lineHeight: type.title.lineHeight,
    color: colors.surface,
    textAlign: 'center',
  },
  actions: { paddingHorizontal: space.lg, gap: space.md },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
  },
  sheetContent: { paddingHorizontal: space.lg, paddingTop: space.xl, gap: space.xl },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: {
    fontFamily: type.title.family,
    fontSize: type.title.size,
    lineHeight: type.title.lineHeight,
    color: colors.ink,
  },
  form: { gap: space.lg },
  error: {
    fontFamily: type.bodyBold.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.disagree,
  },
  signUp: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs },
  signUpText: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
});
