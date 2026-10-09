import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigation } from '@react-navigation/native';
import type { Category, DiscoverySource } from '../../types';

export { MIN_CATEGORIES, MIN_COMPANIES } from './options';

export const ONBOARDING_STEPS = 3;

type OnboardingContextValue = {
  categories: Category[];
  companyIds: string[];
  discovery: DiscoverySource | null;
  toggleCategory: (category: Category) => void;
  toggleCompany: (companyId: string) => void;
  setDiscovery: (source: DiscoverySource) => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [companyIds, setCompanyIds] = useState<string[]>([]);
  const [discovery, setDiscoveryState] = useState<DiscoverySource | null>(null);

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

  const setDiscovery = useCallback((source: DiscoverySource) => setDiscoveryState(source), []);

  const value = useMemo(
    () => ({
      categories,
      companyIds,
      discovery,
      toggleCategory,
      toggleCompany,
      setDiscovery,
    }),
    [categories, companyIds, discovery, toggleCategory, toggleCompany, setDiscovery],
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
