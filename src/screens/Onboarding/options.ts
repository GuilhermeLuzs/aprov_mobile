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
import type { Category, UserGoal } from '../../types';

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

export const GOAL_OPTIONS: { key: UserGoal; title: string; description: string }[] = [
  {
    key: 'discover',
    title: 'Descobrir produtos bons',
    description: 'ver o que vale a pena antes de comprar',
  },
  {
    key: 'share',
    title: 'Compartilhar experiências',
    description: 'escrever o que achei do que usei',
  },
  {
    key: 'earn',
    title: 'Juntar pontos e recompensas',
    description: 'ganhar moedas das empresas parceiras',
  },
];

export const MIN_CATEGORIES = 3;
export const MIN_COMPANIES = 2;
