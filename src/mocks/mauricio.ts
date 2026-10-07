export type MauricioReply = { keywords: string[]; answer: string };

export const mauricioSuggestions: string[] = [
  'O que escrever?',
  'Como ganho mais moedas?',
  'Quem vê minhas fotos?',
  'O que pode ser removido?',
];

export const mauricioReplies: MauricioReply[] = [
  {
    keywords: ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'e ai'],
    answer: 'Oi! Me conta: o que você mais quer que as outras pessoas saibam?',
  },
  {
    keywords: ['escrever', 'comentario', 'comentar', 'dica', 'texto', 'o que falo', 'o que digo'],
    answer:
      'Conte o que você viveu, não só o que achou. Prazo, uso no dia a dia e o que te surpreendeu ajudam muito quem vai comprar.',
  },
  {
    keywords: ['moeda', 'ganh', 'ponto', 'xp', 'recompensa', 'nivel'],
    answer:
      'Cada passo vale uma parte: estrelas 30%, tags 20%, mídia 30% e comentário 20%. Completando tudo, você leva o valor cheio.',
  },
  {
    keywords: ['foto', 'video', 'imagem', 'midia', 'quem ve', 'privacidade', 'lgpd'],
    answer:
      'Suas fotos e vídeos aparecem na avaliação pública. A empresa parceira só pode usar se você autorizar no último passo.',
  },
  {
    keywords: ['remov', 'denunc', 'proib', 'apag', 'regra', 'pode ser', 'nao pode'],
    answer:
      'Ofensa, dado pessoal de outra pessoa, propaganda e informação falsa podem ser denunciados. Se a denúncia proceder, a avaliação sai e as recompensas são estornadas.',
  },
  {
    keywords: ['tamanho', 'caracter', 'limite', 'longo', 'curto'],
    answer: 'O comentário vai até 1000 caracteres. Três ou quatro frases bem contadas já valem muito.',
  },
  {
    keywords: ['obrigad', 'valeu', 'brigad'],
    answer: 'Por nada! Quando quiser, é só voltar e escrever.',
  },
];

export const mauricioFallbacks: string[] = [
  'Não entendi bem. Tenta perguntar de outro jeito, ou toca numa das sugestões.',
  'Hmm, essa eu não sei. Posso te ajudar com o comentário, as recompensas ou as fotos.',
];
