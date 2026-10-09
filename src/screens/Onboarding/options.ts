import {
  GraduationCap,
  HeartPulse,
  type LucideIcon,
  Shirt,
  Smartphone,
  Sofa,
  Sparkles,
  UtensilsCrossed,
  Wrench,
} from 'lucide-react-native';
import type { Category, DiscoverySource } from '../../types';

export const CATEGORY_ORDER: Category[] = [
  'eletronicos',
  'alimentacao',
  'moda',
  'servicos_domesticos',
  'beleza',
  'educacao',
  'casa',
  'saude',
];

export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  eletronicos: Smartphone,
  alimentacao: UtensilsCrossed,
  moda: Shirt,
  servicos_domesticos: Wrench,
  beleza: Sparkles,
  educacao: GraduationCap,
  casa: Sofa,
  saude: HeartPulse,
};

export const DISCOVERY_OPTIONS: { key: DiscoverySource; label: string }[] = [
  { key: 'friend', label: 'Indicação de amigo ou família' },
  { key: 'social', label: 'Redes sociais' },
  { key: 'partner', label: 'Uma empresa parceira me indicou' },
  { key: 'ad', label: 'Anúncio' },
  { key: 'search', label: 'Pesquisa na internet' },
  { key: 'other', label: 'Outro' },
];

export const MIN_CATEGORIES = 3;
export const MIN_COMPANIES = 2;
