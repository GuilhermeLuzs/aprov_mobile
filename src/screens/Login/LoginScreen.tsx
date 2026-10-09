import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, MauricioMascot, TextField } from '../../components';
import { colors, space, type } from '../../theme';
import { signIn } from '../../store/session';
import type { RootStackParamList } from '../../navigation/types';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Login'>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [failed, setFailed] = useState(false);

  const canSubmit = email.trim() !== '' && password !== '';

  const submit = () => {
    if (!canSubmit) return;
    if (!signIn(email, password)) {
      setFailed(true);
      return;
    }
    setFailed(false);
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
              setFailed(false);
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
              setFailed(false);
            }}
            secure
            autoCapitalize="none"
            autoComplete="password"
            returnKeyType="go"
            onSubmitEditing={submit}
          />
          {failed ? <Text style={styles.error}>E-mail ou senha incorretos.</Text> : null}
        </View>

        <Button label="Entrar" fullWidth disabled={!canSubmit} onPress={submit} />

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
