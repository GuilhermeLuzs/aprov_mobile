import type { Company } from '../types';

export const companies: Company[] = [
  {
    id: 'c1',
    name: 'Acer',
    logoUri: 'https://picsum.photos/seed/aprov-logo-acer/160/160',
    description:
      'Notebooks, monitores, projetores e dispositivos conectados para casa e trabalho.',
    categories: ['eletronicos', 'casa', 'saude'],
    coinName: 'AcerCoins',
    coinIconUri: 'https://picsum.photos/seed/aprov-coin-acer/80/80',
    productCount: 5,
    reviewCount: 11,
    averageRating: 3.9,
    followerCount: 18420,
  },
  {
    id: 'c2',
    name: 'Cozinha da Vó Marlene Comidas Caseiras e Congelados Artesanais',
    logoUri: 'https://picsum.photos/seed/aprov-logo-vo/160/160',
    description:
      'Congelados artesanais feitos em pequenos lotes, do jeito caseiro, entregues na sua casa.',
    categories: ['alimentacao'],
    coinName: 'PratosVó',
    coinIconUri: 'https://picsum.photos/seed/aprov-coin-vo/80/80',
    productCount: 5,
    reviewCount: 9,
    averageRating: 4.4,
    followerCount: 2310,
  },
  {
    id: 'c3',
    name: 'Studio Bhering',
    logoUri: 'https://picsum.photos/seed/aprov-logo-bhering/160/160',
    description:
      'Skincare, maquiagem e acessórios autorais, com curso online de automaquiagem.',
    categories: ['beleza', 'moda', 'educacao'],
    coinName: 'BheringGlow',
    coinIconUri: 'https://picsum.photos/seed/aprov-coin-bhering/80/80',
    productCount: 5,
    reviewCount: 8,
    averageRating: 4.1,
    followerCount: 9040,
  },
  {
    id: 'c4',
    name: 'InstaClima Serviços de Refrigeração e Climatização Residencial',
    logoUri: 'https://picsum.photos/seed/aprov-logo-instaclima/160/160',
    description:
      'Instalação, limpeza e manutenção de ar-condicionado com técnicos credenciados.',
    categories: ['servicos_domesticos', 'casa'],
    coinName: 'ClimaPontos',
    coinIconUri: 'https://picsum.photos/seed/aprov-coin-instaclima/80/80',
    productCount: 5,
    reviewCount: 2,
    averageRating: 2.6,
    followerCount: 640,
  },
];
