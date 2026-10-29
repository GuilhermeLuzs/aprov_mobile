import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, MauricioMascot, TextField } from '../../components';
import { colors, space, type } from '../../theme';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim() !== '' && password !== '' && !submitting;

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

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + space.xxl, paddingBottom: insets.bottom + space.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <MauricioMascot size={96} />
          <Text style={styles.title}>Entrar na APROV</Text>
          <Text style={styles.subtitle}>Avalie o que você usa, ganhe moedas e suba de nível.</Text>
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

        <Button label={submitting ? 'Entrando...' : 'Entrar'} fullWidth disabled={!canSubmit} onPress={submit} />

        <View style={styles.signUp}>
          <Text style={styles.signUpText}>Ainda não tem conta?</Text>
          <Button label="Cadastre-se" variant="text" onPress={() => navigation.navigate('SignUp')} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, paddingHorizontal: space.lg, gap: space.xl },
  hero: { alignItems: 'center', gap: space.sm },
  title: {
    marginTop: space.md,
    fontFamily: type.display.family,
    fontSize: type.display.size,
    lineHeight: type.display.lineHeight,
    color: colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  form: { gap: space.lg },
  error: {
    fontFamily: type.bodyBold.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.disagree,
  },
  signUp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
  },
  signUpText: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
});
