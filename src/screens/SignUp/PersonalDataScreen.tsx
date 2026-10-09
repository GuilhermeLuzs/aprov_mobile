import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TextField } from '../../components';
import { isCpfInUse, isEmailInUse } from '../../store/session';
import {
  formatCpf,
  formatDate,
  isValidCpf,
  isValidEmail,
  parseBirthDate,
} from '../../utils/validation';
import type { SignUpStackParamList } from '../../navigation/types';
import { useSignUp, type PersonalData } from './SignUpContext';
import { SignUpLayout } from './SignUpLayout';

type Errors = Partial<Record<keyof PersonalData, string>>;

const CPF_LENGTH = 14;
const DATE_LENGTH = 10;

function validate(data: PersonalData): Errors {
  const errors: Errors = {};
  if (data.name.trim().split(/\s+/).length < 2) errors.name = 'Informe nome e sobrenome.';
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

  const errors = submitted ? validate(data) : {};
  const change = (field: keyof PersonalData) => (value: string) =>
    setData((prev) => ({ ...prev, [field]: value }));

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
        label="Nome completo"
        value={data.name}
        onChangeText={change('name')}
        autoCapitalize="words"
        autoComplete="name"
        error={errors.name}
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
