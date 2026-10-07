import type { Tag } from '../types';

export const tags: Tag[] = [
  { id: 't01', label: 'Chegou antes do prazo', sentiment: 'positive', characteristic: 'entrega', categories: [] },
  { id: 't02', label: 'Bem embalado', sentiment: 'positive', characteristic: 'entrega', categories: [] },
  { id: 't03', label: 'Material resistente', sentiment: 'positive', characteristic: 'qualidade', categories: ['eletronicos', 'moda', 'casa'] },
  { id: 't04', label: 'Acabamento impecável', sentiment: 'positive', characteristic: 'qualidade', categories: [] },
  { id: 't05', label: 'Funciona como descrito', sentiment: 'positive', characteristic: 'conformidade', categories: [] },
  { id: 't06', label: 'Sabor caseiro de verdade', sentiment: 'positive', characteristic: 'qualidade', categories: ['alimentacao'] },
  { id: 't07', label: 'Veio completo', sentiment: 'positive', characteristic: 'conformidade', categories: [] },
  { id: 't08', label: 'Igual às fotos', sentiment: 'positive', characteristic: 'conformidade', categories: [] },
  { id: 't09', label: 'Profissional pontual', sentiment: 'positive', characteristic: 'entrega', categories: ['servicos_domesticos', 'saude', 'educacao'] },
  { id: 't10', label: 'Custo-benefício justo', sentiment: 'positive', characteristic: 'custo_beneficio', categories: [] },
  { id: 't11', label: 'Mais barato que a concorrência', sentiment: 'positive', characteristic: 'custo_beneficio', categories: [] },
  { id: 't12', label: 'Rende bastante', sentiment: 'positive', characteristic: 'custo_beneficio', categories: ['beleza', 'alimentacao'] },

  { id: 't13', label: 'Atrasou muito', sentiment: 'negative', characteristic: 'entrega', categories: [] },
  { id: 't14', label: 'Mal embalado', sentiment: 'negative', characteristic: 'entrega', categories: [] },
  { id: 't15', label: 'Quebrou rápido', sentiment: 'negative', characteristic: 'qualidade', categories: ['eletronicos', 'casa', 'moda'] },
  { id: 't16', label: 'Diferente das fotos', sentiment: 'negative', characteristic: 'conformidade', categories: [] },
  { id: 't17', label: 'Chegou frio ou passado', sentiment: 'negative', characteristic: 'qualidade', categories: ['alimentacao'] },
  { id: 't18', label: 'Faltaram itens', sentiment: 'negative', characteristic: 'conformidade', categories: [] },
  { id: 't19', label: 'Sem manual', sentiment: 'negative', characteristic: 'conformidade', categories: ['eletronicos', 'casa'] },
  { id: 't20', label: 'Serviço malfeito', sentiment: 'negative', characteristic: 'qualidade', categories: ['servicos_domesticos', 'saude', 'educacao'] },
  { id: 't21', label: 'Caro pelo que entrega', sentiment: 'negative', characteristic: 'custo_beneficio', categories: [] },
  { id: 't22', label: 'Cobram taxa escondida', sentiment: 'negative', characteristic: 'custo_beneficio', categories: ['servicos_domesticos'] },
];

export const tagById: Record<string, Tag> = Object.fromEntries(tags.map((t) => [t.id, t]));
