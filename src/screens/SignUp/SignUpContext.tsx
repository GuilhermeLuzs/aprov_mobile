import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export const SIGN_UP_STEPS = 2;

export type PersonalData = {
  name: string;
  email: string;
  birthDate: string;
  cpf: string;
};

const EMPTY_PERSONAL_DATA: PersonalData = { name: '', email: '', birthDate: '', cpf: '' };

type SignUpContextValue = {
  personalData: PersonalData;
  setPersonalData: (data: PersonalData) => void;
};

const SignUpContext = createContext<SignUpContextValue | null>(null);

export function SignUpProvider({ children }: { children: ReactNode }) {
  const [personalData, setPersonalData] = useState<PersonalData>(EMPTY_PERSONAL_DATA);
  const value = useMemo(() => ({ personalData, setPersonalData }), [personalData]);
  return <SignUpContext.Provider value={value}>{children}</SignUpContext.Provider>;
}

export function useSignUp(): SignUpContextValue {
  const ctx = useContext(SignUpContext);
  if (!ctx) {
    throw new Error('useSignUp precisa estar dentro de SignUpProvider');
  }
  return ctx;
}
