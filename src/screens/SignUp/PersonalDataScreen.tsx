import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TextField } from '../../components';
import { isCpfInUse, isEmailInUse, isUsernameInUse } from '../../store/session';
import {
  formatCpf,
  formatDate,
  isValidCpf,
  isValidEmail,
  isValidUsername,
  normalizeUsername,
  parseBirthDate,
  suggestUsername,
  USERNAME_MAX_LENGTH,
} from '../../utils/validation';
import type { SignUpStackParamList } from '../../navigation/types';
import { useSignUp, type PersonalData } from './SignUpContext';
import { SignUpLayout } from './SignUpLayout';

type Errors = Partial<Record<keyof PersonalData, string>>;

const CPF_LENGTH = 14;
const DATE_LENGTH = 10;
const NAME_MAX_LENGTH = 50;

function validate(data: PersonalData): Errors {
  const errors: Errors = {};
  if (data.name.trim() === '') errors.name = 'Informe como quer aparecer no perfil.';
  if (!isValidUsername(data.username)) {
    errors.username = 'Use de 3 a 30 letras, números, ponto ou sublinhado.';
  } else if (isUsernameInUse(data.username)) {
    errors.username = 'Este nome de usuário já está em uso.';
  }
  if (!isValidEmail(data.email)) errors.email = 'E-mail inválido.';
  else if (isEmailInUse(data.email)) errors.email = 'Já existe uma conta com este e-mail.';
  if (!parseBirthDate(data.birthDate)) errors.birthDate = 'Data inválida. Use dia/mês/ano.';
  if (!isValidCpf(data.cpf)) errors.cpf = 'CPF inválido.';
  else if (isCpfInUse(data.cpf)) errors.cpf = 'Já existe uma conta com este CPF.';
  return errors;
}

export default function PersonalDataScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<SignUpStackParamList, 'PersonalData'>>();
  const { personalData, setPersonalData } = useSignUp();
  const [data, setData] = useState<PersonalData>(personalData);
  const [submitted, setSubmitted] = useState(false);
  const [usernameEdited, setUsernameEdited] = useState(personalData.username !== '');

  const errors = submitted ? validate(data) : {};
  const change = (field: keyof PersonalData) => (value: string) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const changeName = (name: string) =>
    setData((prev) => ({
      ...prev,
      name,
      username: usernameEdited ? prev.username : suggestUsername(name),
    }));

  const changeUsername = (text: string) => {
    setUsernameEdited(true);
    change('username')(normalizeUsername(text));
  };

  const next = () => {
    setSubmitted(true);
    if (Object.keys(validate(data)).length > 0) return;
    setPersonalData({ ...data, name: data.name.trim(), email: data.email.trim() });
    navigation.navigate('Password');
  };

  return (
    <SignUpLayout
      step={1}
      title="Crie sua conta"
      subtitle="Seus dados ficam só com a APROV e servem para proteger a sua conta."
      onBack={() => navigation.getParent()?.goBack()}
      primaryLabel="Continuar"
      onPrimary={next}
    >
      <TextField
        label="Nome"
        value={data.name}
        onChangeText={changeName}
        autoCapitalize="words"
        autoComplete="name"
        maxLength={NAME_MAX_LENGTH}
        hint="É como você aparece no seu perfil."
        error={errors.name}
      />
      <TextField
        label="Nome de usuário"
        value={data.username}
        onChangeText={changeUsername}
        prefix="@"
        placeholder="seu.usuario"
        autoCapitalize="none"
        autoComplete="username"
        maxLength={USERNAME_MAX_LENGTH}
        hint="É como as pessoas encontram você na pesquisa."
        error={errors.username}
      />
      <TextField
        label="E-mail"
        value={data.email}
        onChangeText={change('email')}
        placeholder="voce@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={errors.email}
      />
      <TextField
        label="Data de nascimento"
        value={data.birthDate}
        onChangeText={(text) => change('birthDate')(formatDate(text))}
        placeholder="dd/mm/aaaa"
        keyboardType="number-pad"
        maxLength={DATE_LENGTH}
        error={errors.birthDate}
      />
      <TextField
        label="CPF"
        value={data.cpf}
        onChangeText={(text) => change('cpf')(formatCpf(text))}
        placeholder="000.000.000-00"
        keyboardType="number-pad"
        maxLength={CPF_LENGTH}
        error={errors.cpf}
      />
    </SignUpLayout>
  );
}
