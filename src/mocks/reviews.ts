import type {
  CarouselMedia,
  Comment,
  CommentReply,
  PhotoMedia,
  Review,
  ReviewCharacteristic,
  VideoMedia,
} from '../types';
import { tagById } from './tags';
import { productById } from './products';

const round1 = (n: number) => Math.round(n * 10) / 10;

function chars(
  entrega: number,
  qualidade: number,
  conformidade: number,
  custoBeneficio: number,
): { characteristics: ReviewCharacteristic[]; averageRating: number } {
  return {
    characteristics: [
      { key: 'entrega', rating: entrega },
      { key: 'qualidade', rating: qualidade },
      { key: 'conformidade', rating: conformidade },
      { key: 'custo_beneficio', rating: custoBeneficio },
    ],
    averageRating: round1((entrega + qualidade + conformidade + custoBeneficio) / 4),
  };
}

const tag = (...ids: string[]) => ids.map((id) => tagById[id]);

const photo = (id: string, seed: string): PhotoMedia => ({
  id,
  type: 'photo',
  uri: `https://picsum.photos/seed/${seed}/1080/1080`,
  width: 1080,
  height: 1080,
});

const video = (id: string, seed: string, durationSeconds: number): VideoMedia => ({
  id,
  type: 'video',
  uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  thumbnailUri: `https://picsum.photos/seed/${seed}/1080/1920`,
  durationSeconds,
});

const carousel = (id: string, seeds: string[]): CarouselMedia => ({
  id,
  type: 'carousel',
  items: seeds.map((s) => ({
    uri: `https://picsum.photos/seed/${s}/1080/1080`,
    width: 1080,
    height: 1080,
  })),
});

const DISAGREEMENT_RATIO = 8;

function mockDisagreements(agreements: number): number {
  return Math.floor(agreements / DISAGREEMENT_RATIO);
}

function reply(
  id: string,
  parentId: string,
  authorId: string,
  createdAt: string,
  text: string,
  agreements: number,
): CommentReply {
  return { id, parentId, authorId, createdAt, text, agreements, disagreements: mockDisagreements(agreements) };
}

function comment(
  id: string,
  reviewId: string,
  authorId: string,
  createdAt: string,
  text: string,
  agreements: number,
  replies: CommentReply[] = [],
): Comment {
  return {
    id,
    reviewId,
    authorId,
    createdAt,
    text,
    agreements,
    disagreements: mockDisagreements(agreements),
    replies,
  };
}

type Seed = {
  id: string;
  productId: string;
  authorId: string;
  createdAt: string;
  editedAt?: string | null;
  title: string;
  ratings: [number, number, number, number];
  positiveTagIds: string[];
  negativeTagIds: string[];
  media?: Review['media'];
  comment?: string;
  wouldBuyAgain?: boolean | null;
  agreements: number;
  disagreements: number;
  comments?: Comment[];
  commentCount?: number;
  shares?: number;
};

function makeReview(seed: Seed): Review {
  const product = productById[seed.productId];
  const c = chars(...seed.ratings);
  const comments = seed.comments ?? [];
  return {
    id: seed.id,
    productId: seed.productId,
    companyId: product.companyId,
    authorId: seed.authorId,
    createdAt: seed.createdAt,
    editedAt: seed.editedAt ?? null,
    title: seed.title,
    characteristics: c.characteristics,
    averageRating: c.averageRating,
    positiveTags: tag(...seed.positiveTagIds),
    negativeTags: tag(...seed.negativeTagIds),
    media: seed.media ?? [],
    comment: seed.comment ?? '',
    wouldBuyAgain: seed.wouldBuyAgain ?? null,
    agreements: seed.agreements,
    disagreements: seed.disagreements,
    comments,
    commentCount: seed.commentCount ?? comments.length,
    shares: seed.shares ?? 0,
    coinsReward: product.coinsReward,
    xpReward: product.xpReward,
  };
}

const LONG_COMMENT =
  'Uso esse notebook há dois meses, oito horas por dia, entre planilhas pesadas, ' +
  'trinta abas no navegador e chamadas de vídeo o dia inteiro. A máquina não ' +
  'esquenta perto do que eu esperava, o ventilador só aparece quando exporto ' +
  'vídeo e mesmo assim é discreto. O SSD faz o sistema abrir em poucos segundos. ' +
  'O ponto fraco de verdade é a tela: o brilho máximo deixa a desejar perto da ' +
  'janela, e as cores são corretas mas sem vida. Para trabalho é irrelevante, ' +
  'para editar foto você vai querer um monitor externo. A bateria entrega umas ' +
  'seis horas reais com esse uso, longe das dez anunciadas, mas dá para passar ' +
  'meio expediente longe da tomada. Pelo preço que paguei, faria de novo sem pensar.';

const seeds: Seed[] = [
  {
    id: 'r01',
    productId: 'p01',
    authorId: 'u5',
    createdAt: '2026-08-28T13:20:00.000Z',
    title: 'Aguenta um dia inteiro de trabalho pesado sem esquentar',
    ratings: [5, 5, 4.5, 4],
    positiveTagIds: ['t01', 't05', 't10'],
    negativeTagIds: ['t16'],
    media: [video('m01', 'aprov-r01-v', 27)],
    comment: LONG_COMMENT,
    wouldBuyAgain: true,
    agreements: 1284,
    disagreements: 37,
    shares: 214,
    commentCount: 18,
    comments: [
      comment(
        'cm01',
        'r01',
        'u8',
        '2026-08-28T15:00:00.000Z',
        'A tela é isso mesmo. Liguei um monitor externo e o notebook virou outro.',
        42,
        [
          reply(
            'cr01',
            'cm01',
            'u5',
            '2026-08-28T16:10:00.000Z',
            'Exato. Para quem edita foto, monitor externo não é luxo, é requisito.',
            15,
          ),
          reply(
            'cr02',
            'cm01',
            'u1',
            '2026-08-29T09:30:00.000Z',
            'Qual monitor você usou? Estou entre o de 27 da própria Acer e outro.',
            3,
          ),
        ],
      ),
      comment(
        'cm02',
        'r01',
        'u6',
        '2026-08-29T11:45:00.000Z',
        'Seis horas de bateria com esse uso já está ótimo, sinceramente.',
        9,
      ),
    ],
  },
  {
    id: 'r02',
    productId: 'p01',
    authorId: 'u8',
    createdAt: '2026-07-14T18:05:00.000Z',
    title: 'Bom para jogar leve, mas a garantia me deu trabalho',
    ratings: [3.5, 3, 4, 2.5],
    positiveTagIds: ['t05', 't07'],
    negativeTagIds: ['t19', 't21'],
    media: [photo('m02', 'aprov-r02-p')],
    comment:
      'Roda os jogos que eu esperava no médio. O problema foi o suporte: um pixel morto e levei quase um mês para resolver. Chegou sem manual impresso, só o link.',
    wouldBuyAgain: true,
    agreements: 176,
    disagreements: 22,
    shares: 12,
    commentCount: 3,
  },
  {
    id: 'r03',
    productId: 'p01',
    authorId: 'u3',
    createdAt: '2026-06-02T10:15:00.000Z',
    title: 'Chegou dois dias antes e já veio configurado direitinho',
    ratings: [4.5, 4.5, 5, 4],
    positiveTagIds: ['t01', 't02', 't08'],
    negativeTagIds: [],
    media: [carousel('m03', ['aprov-r03-a', 'aprov-r03-b', 'aprov-r03-c'])],
    comment:
      'Embalagem caprichada, três camadas de proteção. Liguei e em vinte minutos estava usando. Recomendo.',
    wouldBuyAgain: true,
    agreements: 331,
    disagreements: 8,
    shares: 40,
    commentCount: 0,
  },
  {
    id: 'r04',
    productId: 'p01',
    authorId: 'u6',
    createdAt: '2026-05-19T21:40:00.000Z',
    title: 'Não era o que estava na descrição',
    ratings: [2, 1.5, 2, 3],
    positiveTagIds: ['t11'],
    negativeTagIds: ['t16', 't18'],
    comment:
      'Anunciaram 16GB mas vieram 8GB soldados mais 8GB em pente. Tecnicamente bate, na prática trava com o meu uso. Decepcionada.',
    wouldBuyAgain: false,
    agreements: 88,
    disagreements: 51,
    shares: 6,
    commentCount: 7,
  },
  {
    id: 'r05',
    productId: 'p01',
    authorId: 'u10',
    createdAt: '2026-08-30T08:00:00.000Z',
    title: 'Primeiras impressões, ainda testando',
    ratings: [3, 3.5, 3, 3],
    positiveTagIds: ['t05'],
    negativeTagIds: ['t21'],
    media: [photo('m05', 'aprov-r05-p')],
    comment: 'Faz uma semana que estou com ele. Depois volto com uma avaliação completa.',
    wouldBuyAgain: null,
    agreements: 0,
    disagreements: 0,
    shares: 0,
    commentCount: 0,
  },

  {
    id: 'r06',
    productId: 'p02',
    authorId: 'u5',
    createdAt: '2026-08-10T12:30:00.000Z',
    title: 'Os 165Hz mudam a sensação de tudo, até do mouse no desktop',
    ratings: [5, 5, 4, 4.5],
    positiveTagIds: ['t04', 't05'],
    negativeTagIds: [],
    media: [video('m06', 'aprov-r06-v', 19)],
    comment: 'Montagem no braço VESA em cinco minutos. Cores boas de fábrica, só ajustei o brilho.',
    wouldBuyAgain: true,
    agreements: 240,
    disagreements: 6,
    shares: 33,
    commentCount: 4,
  },
  {
    id: 'r07',
    productId: 'p02',
    authorId: 'u8',
    createdAt: '2026-07-01T09:10:00.000Z',
    title: 'Ótimo para jogo, base ocupa muito espaço',
    ratings: [4.5, 4.5, 4, 4.5],
    positiveTagIds: ['t03', 't10'],
    negativeTagIds: [],
    media: [photo('m07', 'aprov-r07-p')],
    comment: 'A base é enorme e sem furo para passar cabo. Fora isso, sem defeito.',
    wouldBuyAgain: true,
    agreements: 61,
    disagreements: 4,
    shares: 5,
    commentCount: 1,
  },
  {
    id: 'r08',
    productId: 'p02',
    authorId: 'u2',
    createdAt: '2026-04-22T16:00:00.000Z',
    title: 'Cumpre o que promete',
    ratings: [3.5, 4, 3.5, 3.5],
    positiveTagIds: ['t05'],
    negativeTagIds: ['t14'],
    comment: 'A caixa chegou amassada mas o monitor estava intacto. Funciona bem.',
    wouldBuyAgain: true,
    agreements: 18,
    disagreements: 2,
    shares: 1,
    commentCount: 0,
  },

  {
    id: 'r09',
    productId: 'p03',
    authorId: 'u10',
    createdAt: '2026-06-18T22:15:00.000Z',
    title: 'Só serve no escuro total',
    ratings: [3, 2, 3, 2],
    positiveTagIds: ['t01'],
    negativeTagIds: ['t16', 't21'],
    comment:
      'Os 4000 lúmens do anúncio não existem na prática. Com qualquer luz acesa a imagem some. Para cinema em quarto escuro, ok. Para sala, não.',
    wouldBuyAgain: false,
    agreements: 47,
    disagreements: 12,
    shares: 3,
    commentCount: 5,
  },
  {
    id: 'r10',
    productId: 'p03',
    authorId: 'u8',
    createdAt: '2026-03-30T20:00:00.000Z',
    title: 'Mediano, o foco desregula sozinho',
    ratings: [3.5, 3, 3.5, 3],
    positiveTagIds: ['t10'],
    negativeTagIds: ['t15'],
    media: [photo('m10', 'aprov-r10-p')],
    comment: 'A cada duas horas de uso preciso reajustar o foco. Incomoda.',
    wouldBuyAgain: null,
    agreements: 21,
    disagreements: 9,
    shares: 0,
    commentCount: 2,
  },

  {
    id: 'r11',
    productId: 'p04',
    authorId: 'u1',
    createdAt: '2026-08-05T07:45:00.000Z',
    editedAt: '2026-08-06T10:00:00.000Z',
    title: 'A diferença na crise de rinite foi real no primeiro fim de semana',
    ratings: [4, 4.5, 3.5, 4],
    positiveTagIds: ['t05', 't10'],
    negativeTagIds: ['t19'],
    media: [photo('m11', 'aprov-r11-p')],
    comment:
      'Acordei sem o nariz entupido pela primeira vez em meses. O modo noturno é realmente silencioso. O app poderia mostrar o histórico, hoje só mostra o número do momento.',
    wouldBuyAgain: true,
    agreements: 73,
    disagreements: 5,
    shares: 9,
    commentCount: 2,
    comments: [
      comment(
        'cm11',
        'r11',
        'u4',
        '2026-08-05T12:00:00.000Z',
        'O filtro de reposição é caro? É o que me segura.',
        6,
        [
          reply(
            'cr11',
            'cm11',
            'u1',
            '2026-08-05T13:30:00.000Z',
            'Uns 20% do valor do aparelho a cada seis meses. Não é barato, mas dura.',
            4,
          ),
        ],
      ),
    ],
  },

  {
    id: 'r12',
    productId: 'p06',
    authorId: 'u7',
    createdAt: '2026-08-25T19:30:00.000Z',
    title: 'Molho de verdade, cozido de horas, não aquele aguado de mercado',
    ratings: [4.5, 5, 5, 4],
    positiveTagIds: ['t02', 't06', 't12'],
    negativeTagIds: [],
    media: [carousel('m12', ['aprov-r12-a', 'aprov-r12-b', 'aprov-r12-c', 'aprov-r12-d'])],
    comment:
      'Comprei achando que seria mais uma. Errei. A massa fica al dente mesmo depois do forno, o molho tem sabor de domingo na casa da avó. Serviu três pessoas com fome. Voltou pra lista fixa da semana.',
    wouldBuyAgain: true,
    agreements: 194,
    disagreements: 4,
    shares: 58,
    commentCount: 11,
    comments: [
      comment(
        'cm12',
        'r12',
        'u2',
        '2026-08-25T21:00:00.000Z',
        'Assino embaixo. A de quatro queijos é tão boa quanto.',
        22,
        [
          reply(
            'cr12',
            'cm12',
            'u7',
            '2026-08-26T08:15:00.000Z',
            'Vou pedir essa no próximo. Obrigada pela dica.',
            5,
          ),
        ],
      ),
      comment(
        'cm13',
        'r12',
        'u9',
        '2026-08-26T10:20:00.000Z',
        'O tempo de forno bate com o da embalagem ou precisa de mais?',
        3,
        [
          reply(
            'cr13',
            'cm13',
            'u7',
            '2026-08-26T11:00:00.000Z',
            'Precisei de uns dez minutos a mais que o rótulo, forno de casa é sempre mais fraco.',
            7,
          ),
        ],
      ),
    ],
  },
  {
    id: 'r13',
    productId: 'p06',
    authorId: 'u2',
    createdAt: '2026-07-08T18:00:00.000Z',
    title: 'Melhor lasanha congelada que já comi',
    ratings: [5, 5, 4.5, 4],
    positiveTagIds: ['t01', 't06'],
    negativeTagIds: [],
    media: [photo('m13', 'aprov-r13-p')],
    comment: 'Chegou totalmente congelada, gelo seco na caixa. Sabor impecável.',
    wouldBuyAgain: true,
    agreements: 77,
    disagreements: 1,
    shares: 14,
    commentCount: 0,
  },
  {
    id: 'r14',
    productId: 'p06',
    authorId: 'u4',
    createdAt: '2026-05-27T20:45:00.000Z',
    title: 'Sabor bom, mas a minha chegou meio esfarelada',
    ratings: [2.5, 3.5, 4, 3],
    positiveTagIds: ['t06'],
    negativeTagIds: ['t14', 't17'],
    media: [video('m14', 'aprov-r14-v', 22)],
    comment:
      'O entregador claramente virou a caixa. As camadas desmontaram. O gosto salvou, por isso três estrelas e não menos.',
    wouldBuyAgain: true,
    agreements: 33,
    disagreements: 6,
    shares: 2,
    commentCount: 3,
  },

  {
    id: 'r15',
    productId: 'p07',
    authorId: 'u7',
    createdAt: '2026-08-19T15:10:00.000Z',
    title: 'Ponto perfeito, nem duro nem mole, e o chocolate é sério',
    ratings: [5, 5, 5, 4.5],
    positiveTagIds: ['t04', 't06', 't12'],
    negativeTagIds: [],
    media: [photo('m15', 'aprov-r15-p')],
    comment: 'Encomendei para uma reunião e todo mundo pediu o contato. Rende bem para o preço.',
    wouldBuyAgain: true,
    agreements: 121,
    disagreements: 1,
    shares: 31,
    commentCount: 2,
  },
  {
    id: 'r16',
    productId: 'p07',
    authorId: 'u9',
    createdAt: '2026-06-11T13:00:00.000Z',
    title: 'Muito bom, só achei pequeno para o valor',
    ratings: [4.5, 4.5, 4, 3],
    positiveTagIds: ['t06'],
    negativeTagIds: ['t21'],
    comment: '',
    wouldBuyAgain: null,
    agreements: 14,
    disagreements: 8,
    shares: 0,
    commentCount: 0,
  },

  {
    id: 'r17',
    productId: 'p08',
    authorId: 'u7',
    createdAt: '2026-08-02T08:30:00.000Z',
    title: 'Cresce bonito e fica oco por dentro, do jeito certo',
    ratings: [4.5, 4.5, 4, 4],
    positiveTagIds: ['t02', 't06'],
    negativeTagIds: [],
    media: [carousel('m17', ['aprov-r17-a', 'aprov-r17-b'])],
    comment: 'Assei direto do congelador, vinte minutos, saiu perfeito. O queijo canastra faz diferença.',
    wouldBuyAgain: true,
    agreements: 88,
    disagreements: 5,
    shares: 12,
    commentCount: 1,
  },

  {
    id: 'r19',
    productId: 'p09',
    authorId: 'u4',
    createdAt: '2026-07-21T11:50:00.000Z',
    title: 'Salva o almoço em dia corrido, mas o frango resseca no micro-ondas',
    ratings: [4, 3, 3.5, 3.5],
    positiveTagIds: ['t01', 't10'],
    negativeTagIds: ['t16'],
    media: [video('m19', 'aprov-r19-v', 15)],
    comment:
      'A porção é honesta e o preço fecha. O frango, se você seguir o tempo da embalagem, vira borracha. Tiro um minuto antes e fica ok.',
    wouldBuyAgain: true,
    agreements: 34,
    disagreements: 19,
    shares: 4,
    commentCount: 6,
  },

  {
    id: 'r20',
    productId: 'p10',
    authorId: 'u7',
    createdAt: '2026-06-28T19:15:00.000Z',
    title: 'Encorpado de verdade, a linguiça é artesanal mesmo',
    ratings: [4.5, 4.5, 4.5, 4.5],
    positiveTagIds: ['t06', 't10'],
    negativeTagIds: [],
    media: [photo('m20', 'aprov-r20-p')],
    comment: 'Não é aquele caldo ralo. A couve vem cortada fininha, a batata desmancha na medida.',
    wouldBuyAgain: true,
    agreements: 52,
    disagreements: 3,
    shares: 8,
    commentCount: 0,
  },

  {
    id: 'r21',
    productId: 'p11',
    authorId: 'u4',
    createdAt: '2026-08-22T07:00:00.000Z',
    title: 'Trinta dias de uso: as manchas de sol clarearam de leve, textura melhorou muito',
    ratings: [4.5, 4.5, 4, 4],
    positiveTagIds: ['t04', 't05', 't12'],
    negativeTagIds: ['t21'],
    media: [carousel('m21', ['aprov-r21-a', 'aprov-r21-b', 'aprov-r21-c'])],
    comment:
      'Fiz foto no primeiro dia e no trigésimo, mesma luz. A diferença nas manchas é sutil mas existe. O que mudou mesmo foi o viço e o tamanho dos poros. Absorve rápido, não gruda. Só acho caro.',
    wouldBuyAgain: true,
    agreements: 276,
    disagreements: 21,
    shares: 63,
    commentCount: 14,
    comments: [
      comment(
        'cm21',
        'r21',
        'u9',
        '2026-08-22T09:40:00.000Z',
        'Ardeu na sua pele nos primeiros dias? A vitamina C a 15% costuma incomodar.',
        18,
        [
          reply(
            'cr21',
            'cm21',
            'u4',
            '2026-08-22T10:15:00.000Z',
            'Os dois primeiros dias sim, um leve formigamento. Depois o rosto se acostumou.',
            9,
          ),
          reply(
            'cr22',
            'cm21',
            'u6',
            '2026-08-23T08:00:00.000Z',
            'Na minha ardeu demais, tive que intercalar dia sim, dia não.',
            4,
          ),
        ],
      ),
    ],
  },
  {
    id: 'r22',
    productId: 'p11',
    authorId: 'u9',
    createdAt: '2026-07-30T06:30:00.000Z',
    title: 'Melhor custo por mês que os importados que eu usava',
    ratings: [4.5, 4, 4, 4.5],
    positiveTagIds: ['t05', 't11'],
    negativeTagIds: [],
    media: [video('m22', 'aprov-r22-v', 31)],
    comment: 'Trinta mililitros duraram dois meses e meio com uso diário. Faz o trabalho.',
    wouldBuyAgain: true,
    agreements: 97,
    disagreements: 6,
    shares: 19,
    commentCount: 3,
  },
  {
    id: 'r23',
    productId: 'p11',
    authorId: 'u6',
    createdAt: '2026-05-14T22:10:00.000Z',
    title: 'Não vi resultado, mas também não irritou',
    ratings: [4, 3, 3, 2.5],
    positiveTagIds: ['t05'],
    negativeTagIds: ['t21'],
    comment:
      'Usei o frasco inteiro esperando alguma mudança nas manchas. Nada que eu conseguisse fotografar. Para hidratação leve, serve. Para clareamento, não senti.',
    wouldBuyAgain: false,
    agreements: 41,
    disagreements: 33,
    shares: 5,
    commentCount: 9,
  },

  {
    id: 'r24',
    productId: 'p12',
    authorId: 'u9',
    createdAt: '2026-07-05T14:25:00.000Z',
    title: 'Fixa bem, mas resseca depois de umas horas',
    ratings: [4, 3.5, 3.5, 3.5],
    positiveTagIds: ['t05'],
    negativeTagIds: ['t16'],
    media: [photo('m24', 'aprov-r24-p')],
    comment: 'A cor no braço é linda, na boca puxa mais pro marrom. Passa no teste do café, mas repuxa.',
    wouldBuyAgain: true,
    agreements: 63,
    disagreements: 12,
    shares: 7,
    commentCount: 4,
  },
  {
    id: 'r25',
    productId: 'p12',
    authorId: 'u4',
    createdAt: '2026-04-02T16:40:00.000Z',
    title: 'O tom que chegou não é o da foto',
    ratings: [3, 2, 2.5, 3],
    positiveTagIds: ['t10'],
    negativeTagIds: ['t16'],
    comment:
      'Pedi o Terracota esperando o tijolo da foto. Veio um bordô. Pode ser lote, pode ser tela, mas não foi o que comprei.',
    wouldBuyAgain: false,
    agreements: 28,
    disagreements: 16,
    shares: 2,
    commentCount: 5,
  },

  {
    id: 'r26',
    productId: 'p13',
    authorId: 'u9',
    createdAt: '2026-08-16T21:30:00.000Z',
    title: 'Rotina completa que cabe no bolso e realmente dura os dois meses',
    ratings: [5, 5, 5, 4.5],
    positiveTagIds: ['t07', 't08', 't12'],
    negativeTagIds: [],
    media: [carousel('m26', ['aprov-r26-a', 'aprov-r26-b', 'aprov-r26-c'])],
    comment:
      'Os três passos conversam entre si, sem aquela sensação de repuxar. O folheto explica a ordem e a frequência do ácido, que é onde a maioria erra. Minha pele nunca esteve tão calma.',
    wouldBuyAgain: true,
    agreements: 141,
    disagreements: 2,
    shares: 44,
    commentCount: 7,
  },

  {
    id: 'r27',
    productId: 'p14',
    authorId: 'u8',
    createdAt: '2026-08-29T18:50:00.000Z',
    title: 'Charneira quebrou na primeira semana',
    ratings: [2, 1, 2, 2],
    positiveTagIds: ['t04'],
    negativeTagIds: ['t15', 't21'],
    media: [photo('m27', 'aprov-r27-p')],
    comment:
      'Acetato bonito, lente boa, mas a dobradiça soltou com uma semana de uso normal, guardando no estojo. Aguardando a troca.',
    wouldBuyAgain: false,
    agreements: 0,
    disagreements: 0,
    shares: 0,
    commentCount: 0,
  },

  {
    id: 'r28',
    productId: 'p15',
    authorId: 'u4',
    createdAt: '2026-06-22T10:05:00.000Z',
    title: 'Didático de verdade para quem começa do zero',
    ratings: [4.5, 4, 4.5, 3.5],
    positiveTagIds: ['t08', 't10'],
    negativeTagIds: ['t21'],
    comment:
      'As aulas de preparo de pele e de correção sozinhas já pagam o curso. A parte de olho esfumado é rápida demais, senti falta de mais exemplos em peles diferentes. Acesso por um ano ajuda a revisar.',
    wouldBuyAgain: true,
    agreements: 97,
    disagreements: 14,
    shares: 22,
    commentCount: 8,
  },

  {
    id: 'r29',
    productId: 'p17',
    authorId: 'u10',
    createdAt: '2026-07-18T13:35:00.000Z',
    title: 'Cobraram taxa de deslocamento que não estava no orçamento',
    ratings: [2.5, 3, 2, 1.5],
    positiveTagIds: ['t09'],
    negativeTagIds: ['t22'],
    media: [photo('m29', 'aprov-r29-p')],
    comment:
      'O técnico chegou no horário e o serviço em si foi ok. Na hora de pagar apareceu uma taxa de deslocamento de bairro que ninguém tinha mencionado. Fica a ressalva.',
    wouldBuyAgain: false,
    agreements: 5,
    disagreements: 17,
    shares: 1,
    commentCount: 2,
  },

  {
    id: 'r30',
    productId: 'p16',
    authorId: 'u3',
    createdAt: '2026-08-12T09:00:00.000Z',
    title: 'Instalação com vácuo malfeito, gelou mal e vazou em uma semana',
    ratings: [3, 1.5, 2, 2.5],
    positiveTagIds: ['t09'],
    negativeTagIds: ['t20', 't22'],
    media: [video('m30', 'aprov-r30-v', 34)],
    comment:
      'Trabalho com isso, então percebi na hora que o tempo de vácuo foi curto demais. Sete dias depois o aparelho estava gelando pouco, chamei outra empresa e havia perda de gás na conexão. Tive retrabalho e custo dobrado.',
    wouldBuyAgain: false,
    agreements: 84,
    disagreements: 9,
    shares: 17,
    commentCount: 12,
    comments: [
      comment(
        'cm30',
        'r30',
        'u10',
        '2026-08-12T14:20:00.000Z',
        'Passei pelo mesmo. Vácuo de dez minutos não existe, são quarenta no mínimo.',
        29,
        [
          reply(
            'cr30',
            'cm30',
            'u3',
            '2026-08-12T15:00:00.000Z',
            'Isso. E tem que medir com o vacuômetro, não no olho.',
            13,
          ),
        ],
      ),
    ],
  },
];

export const reviews: Review[] = seeds.map(makeReview);

export const reviewById: Record<string, Review> = Object.fromEntries(
  reviews.map((r) => [r.id, r]),
);
