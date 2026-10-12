export type Category =
  | 'eletronicos'
  | 'alimentacao'
  | 'moda'
  | 'servicos_domesticos'
  | 'beleza'
  | 'educacao'
  | 'casa'
  | 'saude';

export const CATEGORY_LABEL: Record<Category, string> = {
  eletronicos: 'Eletrônicos',
  alimentacao: 'Alimentação',
  moda: 'Moda',
  servicos_domesticos: 'Serviços domésticos',
  beleza: 'Beleza',
  educacao: 'Educação',
  casa: 'Casa',
  saude: 'Saúde',
};

export type CoinIcon =
  | 'coins'
  | 'cpu'
  | 'utensils'
  | 'sparkles'
  | 'snowflake'
  | 'coffee'
  | 'eye'
  | 'paw-print'
  | 'book-open'
  | 'hammer'
  | 'heart-pulse'
  | 'zap'
  | 'graduation-cap'
  | 'star'
  | 'heart'
  | 'leaf'
  | 'gem'
  | 'flame';

export interface Company {
  id: string;
  name: string;
  logoUri: string;
  description: string;
  categories: Category[];
  coinName: string;
  coinIcon: CoinIcon;
  coinColor: string;
  productCount: number;
  reviewCount: number;
  averageRating: number;
  followerCount: number;
}
