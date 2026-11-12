import type {
  ApiComment,
  ApiCompany,
  ApiCompanySummary,
  ApiItem,
  ApiItemCard,
  ApiItemMedia,
  ApiProfile,
  ApiReview,
  ApiReviewAuthor,
  ApiReviewItem,
  ApiReviewMedia,
  ApiTag,
} from '../api';
import { colors } from '../theme';
import type {
  Comment,
  CommentReply,
  Company,
  Media,
  MediaFile,
  Product,
  Review,
  ReviewCharacteristic,
  Tag,
  User,
} from '../types';
import { toReviewMedia } from '../utils/media';

const DEFAULT_MEDIA_SIDE = 1080;

export const ANONYMOUS_AUTHOR_ID = 'autor-anonimo';

export const reviewKey = (reviewId: number) => String(reviewId);

export const reviewIdOf = (key: string) => Number(key);

export const commentIdOf = (key: string) => Number(key);

export const anonymousAuthor: User = {
  id: ANONYMOUS_AUTHOR_ID,
  name: 'Autor anônimo',
  handle: '',
  avatarUri: '',
  bio: '',
  level: 1,
  xp: 0,
  xpLevelFloor: 0,
  xpLevelCeiling: 0,
  badges: [],
  reviewCount: 0,
  agreementsReceived: 0,
  joinedAt: '',
};

export function companyFromApi(api: ApiCompany): Company {
  return {
    ...companyFromSummary(api),
    description: api.description ?? '',
    categories: api.categories,
    productCount: api.itemCount,
    reviewCount: api.reviewCount,
    averageRating: api.averageRating,
    followerCount: api.followerCount,
  };
}

export function companyFromSummary(api: ApiCompanySummary): Company {
  return {
    id: String(api.id),
    name: api.name,
    logoUri: api.logoUrl ?? '',
    description: '',
    categories: [],
    coinName: api.coin?.name ?? 'Moedas',
    coinIcon: api.coin?.icon ?? 'coins',
    coinColor: api.coin?.color ?? colors.primary,
    productCount: 0,
    reviewCount: 0,
    averageRating: 0,
    followerCount: 0,
  };
}

function mediaFromApi(media: ApiItemMedia): Media {
  if (media.type === 'video') {
    return {
      id: String(media.id),
      type: 'video',
      uri: media.url,
      thumbnailUri: media.coverUrl ?? '',
      durationSeconds: media.durationSeconds ?? 0,
    };
  }
  return {
    id: String(media.id),
    type: 'photo',
    uri: media.url,
    width: media.width ?? DEFAULT_MEDIA_SIDE,
    height: media.height ?? DEFAULT_MEDIA_SIDE,
  };
}

function emptyProduct(id: number, companyId: number): Product {
  return {
    id: String(id),
    companyId: String(companyId),
    kind: 'product',
    categories: [],
    title: '',
    description: '',
    imageUri: '',
    media: [],
    averageRating: 0,
    reviewCount: 0,
    agreements: 0,
    disagreements: 0,
    coinsReward: 0,
    xpReward: 0,
    savedByCurrentUser: false,
    purchasedByCurrentUser: false,
    reviewedByCurrentUser: false,
  };
}

export function productFromApi(api: ApiItem): Product {
  const cover = api.media.find((m) => m.type === 'photo');
  return {
    ...emptyProduct(api.id, api.companyId),
    kind: api.kind,
    categories: api.categories,
    title: api.title,
    description: api.description ?? '',
    imageUri: cover?.url ?? '',
    media: api.media.map(mediaFromApi),
    averageRating: api.averageRating,
    reviewCount: api.reviewCount,
    coinsReward: api.maxRewards.coins,
    xpReward: api.maxRewards.xp,
    savedByCurrentUser: api.saved ?? false,
    purchasedByCurrentUser: api.purchased ?? false,
  };
}

export function productFromCard(api: ApiItemCard): Product {
  return {
    ...emptyProduct(api.id, api.companyId),
    kind: api.kind,
    categories: api.categories,
    title: api.title,
    imageUri: api.coverUrl ?? '',
    averageRating: api.averageRating,
    reviewCount: api.reviewCount,
    coinsReward: api.maxRewards.coins,
    xpReward: api.maxRewards.xp,
    savedByCurrentUser: api.saved ?? false,
    purchasedByCurrentUser: api.purchased ?? false,
  };
}

export function productFromReviewItem(api: ApiReviewItem): Product {
  return {
    ...emptyProduct(api.id, api.companyId),
    kind: api.kind,
    title: api.title,
    imageUri: api.coverUrl ?? '',
  };
}

export function tagFromApi(api: ApiTag): Tag {
  return {
    id: String(api.id),
    label: api.label,
    sentiment: api.sentiment,
    characteristic: api.characteristic,
    categories: api.categories,
  };
}

export function authorFromApi(api: ApiReviewAuthor | null): User {
  if (!api) return anonymousAuthor;
  return {
    ...anonymousAuthor,
    id: String(api.id),
    name: api.name,
    handle: `@${api.username}`,
    avatarUri: api.avatarUrl ?? '',
    level: api.level,
  };
}

export function userFromProfile(api: ApiProfile): User {
  return {
    ...anonymousAuthor,
    id: String(api.id),
    name: api.name,
    handle: `@${api.username}`,
    avatarUri: api.avatarUrl ?? '',
    bio: api.bio,
    level: api.level,
    xp: api.xp,
    reviewCount: api.reviewCount ?? 0,
    agreementsReceived: api.agreementsReceived ?? 0,
    joinedAt: api.joinedAt,
  };
}

function characteristicsFrom(ratings: {
  deliveryRating: number;
  qualityRating: number;
  conformityRating: number;
  valueRating: number;
}): ReviewCharacteristic[] {
  return [
    { key: 'entrega', rating: ratings.deliveryRating },
    { key: 'qualidade', rating: ratings.qualityRating },
    { key: 'conformidade', rating: ratings.conformityRating },
    { key: 'custo_beneficio', rating: ratings.valueRating },
  ];
}

function reviewMediaFrom(media: ApiReviewMedia[]): Media[] {
  return toReviewMedia(
    media.map((m) => ({
      id: String(m.id),
      kind: m.type,
      uri: m.url,
      thumbnailUri: m.coverUrl ?? '',
      width: m.width ?? DEFAULT_MEDIA_SIDE,
      height: m.height ?? DEFAULT_MEDIA_SIDE,
      durationSeconds: m.durationSeconds ?? 0,
    })),
  );
}

function mediaFilesFrom(media: ApiReviewMedia[]): MediaFile[] {
  return media.map((m) => ({
    id: String(m.id),
    kind: m.type,
    previewUri: m.type === 'video' ? m.coverUrl ?? '' : m.url,
  }));
}

export function reviewFromApi(api: ApiReview): Review {
  return {
    id: reviewKey(api.id),
    productId: String(api.itemId),
    companyId: api.item ? String(api.item.companyId) : '',
    authorId: api.author ? String(api.author.id) : ANONYMOUS_AUTHOR_ID,
    createdAt: api.createdAt,
    editedAt: api.editedAt,
    versions: (api.versions ?? []).map((version) => {
      const tags = (version.tags ?? []).map(tagFromApi);
      const media = version.media ?? [];
      return {
        id: `version-${version.id}`,
        publishedAt: version.publishedAt,
        characteristics: characteristicsFrom(version),
        averageRating: version.averageRating,
        positiveTags: tags.filter((tag) => tag.sentiment === 'positive'),
        negativeTags: tags.filter((tag) => tag.sentiment === 'negative'),
        media: reviewMediaFrom(media),
        mediaFiles: mediaFilesFrom(media),
        comment: version.comment,
        wouldBuyAgain: version.wouldBuyAgain,
      };
    }),
    title: '',
    characteristics: characteristicsFrom(api),
    averageRating: api.averageRating,
    positiveTags: api.positiveTags.map(tagFromApi),
    negativeTags: api.negativeTags.map(tagFromApi),
    media: reviewMediaFrom(api.media),
    mediaFiles: mediaFilesFrom(api.media),
    comment: api.comment,
    wouldBuyAgain: api.wouldBuyAgain,
    agreements: api.agreements ?? 0,
    disagreements: api.disagreements ?? 0,
    myVote: api.myVote ?? null,
    votesByVersion: api.votesByVersion,
    comments: [],
    commentCount: api.commentCount ?? 0,
    shares: 0,
    coinsReward: api.rewards?.coins ?? 0,
    xpReward: api.rewards?.xp ?? 0,
  };
}

function replyFromApi(api: ApiComment): CommentReply {
  return {
    id: String(api.id),
    parentId: String(api.parentId),
    authorId: api.author ? String(api.author.id) : ANONYMOUS_AUTHOR_ID,
    createdAt: api.createdAt,
    text: api.body,
    editedAt: api.editedAt,
    deleted: api.deleted,
    agreements: api.agreements,
    disagreements: api.disagreements,
    myVote: api.myVote ?? null,
  };
}

export function commentFromApi(api: ApiComment): Comment {
  return {
    id: String(api.id),
    reviewId: reviewKey(api.reviewId),
    authorId: api.author ? String(api.author.id) : ANONYMOUS_AUTHOR_ID,
    createdAt: api.createdAt,
    text: api.body,
    editedAt: api.editedAt,
    deleted: api.deleted,
    agreements: api.agreements,
    disagreements: api.disagreements,
    myVote: api.myVote ?? null,
    replies: (api.replies ?? []).map(replyFromApi),
  };
}

export function commentAuthors(api: ApiComment[]): User[] {
  return api.flatMap((comment) => [comment, ...(comment.replies ?? [])]).map((c) => authorFromApi(c.author));
}
