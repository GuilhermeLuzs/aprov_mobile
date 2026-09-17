import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigation } from '@react-navigation/native';
import type { Category, UserGoal } from '../../types';

export type OnboardingGoal = UserGoal;

export { MIN_CATEGORIES, MIN_COMPANIES } from './options';

type OnboardingContextValue = {
  categories: Category[];
  companyIds: string[];
  goal: OnboardingGoal | null;
  toggleCategory: (category: Category) => void;
  toggleCompany: (companyId: string) => void;
  setGoal: (goal: OnboardingGoal) => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [companyIds, setCompanyIds] = useState<string[]>([]);
  const [goal, setGoalState] = useState<OnboardingGoal | null>(null);

  const toggleCategory = useCallback((category: Category) => {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  }, []);

  const toggleCompany = useCallback((companyId: string) => {
    setCompanyIds((prev) =>
      prev.includes(companyId) ? prev.filter((id) => id !== companyId) : [...prev, companyId],
    );
  }, []);

  const setGoal = useCallback((next: OnboardingGoal) => setGoalState(next), []);

  const value = useMemo(
    () => ({ categories, companyIds, goal, toggleCategory, toggleCompany, setGoal }),
    [categories, companyIds, goal, toggleCategory, toggleCompany, setGoal],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding precisa estar dentro de OnboardingProvider');
  }
  return ctx;
}

export function useLeaveOnboarding(): () => void {
  const navigation = useNavigation();
  return useCallback(() => {
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  }, [navigation]);
}
