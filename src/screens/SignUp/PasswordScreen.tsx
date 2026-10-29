import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check, Circle } from 'lucide-react-native';
import { TextField } from '../../components';
import { colors, icon, space, type } from '../../theme';
import { signUp } from '../../store/session';
import { isValidPassword, passwordRules } from '../../utils/validation';
import type { SignUpStackParamList } from '../../navigation/types';
import { useSignUp } from './SignUpContext';
import { SignUpLayout } from './SignUpLayout';

const SIGN_UP_ERROR = {
  'email-in-use': 'Já existe uma conta com este e-mail. Volte e use outro.',
  'cpf-in-use': 'Já existe uma conta com este CPF. Volte e confira.',
  'username-in-use': 'Este nome de usuário acabou de ser usado. Volte e escolha outro.',
  error: 'Não deu para criar a conta agora. Confira a internet e tente de novo.',
} as const;

export default function PasswordScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<SignUpStackParamList, 'Password'>>();
  const { personalData } = useSignUp();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const rules = passwordRules(password);
  const mismatch = confirmation !== '' && confirmation !== password;

  const create = async () => {
    setSubmitted(true);
    if (!isValidPassword(password) || confirmation !== password) return;
    setSubmitting(true);
    const result = await signUp({
      name: personalData.name,
      username: personalData.username,
      email: personalData.email,
      birthDate: personalData.birthDate,
      cpf: personalData.cpf,
      password,
    });
    setSubmitting(false);
    if (result !== 'ok') {
      setSignUpError(SIGN_UP_ERROR[result]);
      return;
    }
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
  };

  return (
    <SignUpLayout
      step={2}
      title="Crie uma senha"
      subtitle={`Ela vai proteger a conta de ${personalData.email}.`}
      onBack={() => navigation.goBack()}
      primaryLabel={submitting ? 'Criando...' : 'Criar conta'}
      primaryDisabled={submitting}
      onPrimary={create}
    >
      <TextField
        label="Senha"
        value={password}
        onChangeText={setPassword}
        secure
        autoCapitalize="none"
        autoComplete="new-password"
        error={submitted && !isValidPassword(password) ? 'A senha ainda não atende aos requisitos.' : undefined}
      />

      <View style={styles.rules}>
        <Rule ok={rules.length} label="8 caracteres ou mais" />
        <Rule ok={rules.letter} label="Pelo menos uma letra" />
        <Rule ok={rules.number} label="Pelo menos um número" />
      </View>

      <TextField
        label="Confirme a senha"
        value={confirmation}
        onChangeText={setConfirmation}
        secure
        autoCapitalize="none"
        autoComplete="new-password"
        error={
          mismatch || (submitted && confirmation !== password)
            ? 'As senhas não são iguais.'
            : undefined
        }
      />

      {signUpError ? <Text style={styles.error}>{signUpError}</Text> : null}
    </SignUpLayout>
  );
}

function Rule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View style={styles.rule} accessible accessibilityLabel={`${label}: ${ok ? 'ok' : 'pendente'}`}>
      {ok ? (
        <Check size={icon.size.sm} color={colors.agree} strokeWidth={3} />
      ) : (
        <Circle size={icon.size.sm} color={colors.inkFaint} strokeWidth={icon.strokeWidth} />
      )}
      <Text style={[styles.ruleText, ok && styles.ruleOk]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rules: { gap: space.xs, marginTop: -space.sm },
  rule: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  ruleText: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  ruleOk: { color: colors.agree },
  error: {
    fontFamily: type.bodyBold.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.disagree,
  },
});
