import type { MediaFile, Review, ReviewCharacteristicKey, Tag } from '../types';

export type ReviewSnapshot = Pick<
  Review,
  | 'characteristics'
  | 'averageRating'
  | 'positiveTags'
  | 'negativeTags'
  | 'media'
  | 'mediaFiles'
  | 'comment'
  | 'wouldBuyAgain'
> & { publishedAt: string };

export type SnapshotChanges = {
  previousRatings: Partial<Record<ReviewCharacteristicKey, number>>;
  previousAverage: number | null;
  addedTagIds: string[];
  removedPositiveTags: Tag[];
  removedNegativeTags: Tag[];
  addedMediaCount: number;
  removedMedia: MediaFile[];
  previousWouldBuyAgain: boolean | null | undefined;
  commentChanged: boolean;
};

export function versionNumberOf(snapshots: ReviewSnapshot[], createdAt: string): number | null {
  const time = Date.parse(createdAt);
  let index = 0;
  snapshots.forEach((snapshot, position) => {
    if (Date.parse(snapshot.publishedAt) <= time) index = position;
  });
  return index === snapshots.length - 1 ? null : index + 1;
}

export function snapshotsOf(review: Review): ReviewSnapshot[] {
  const current: ReviewSnapshot = { ...review, publishedAt: review.editedAt ?? review.createdAt };
  return [...[...review.versions].reverse(), current];
}

function missingFrom<T extends { id: string }>(list: T[], other: T[]): T[] {
  return list.filter((entry) => !other.some((candidate) => candidate.id === entry.id));
}

export function changesBetween(previous: ReviewSnapshot | undefined, current: ReviewSnapshot): SnapshotChanges | null {
  if (!previous) return null;

  const previousRatings: SnapshotChanges['previousRatings'] = {};
  current.characteristics.forEach((characteristic) => {
    const before = previous.characteristics.find((c) => c.key === characteristic.key);
    if (before && before.rating !== characteristic.rating) previousRatings[characteristic.key] = before.rating;
  });

  const currentTags = [...current.positiveTags, ...current.negativeTags];
  const previousTags = [...previous.positiveTags, ...previous.negativeTags];

  return {
    previousRatings,
    previousAverage: previous.averageRating !== current.averageRating ? previous.averageRating : null,
    addedTagIds: missingFrom(currentTags, previousTags).map((tag) => tag.id),
    removedPositiveTags: missingFrom(previous.positiveTags, currentTags),
    removedNegativeTags: missingFrom(previous.negativeTags, currentTags),
    addedMediaCount: missingFrom(current.mediaFiles, previous.mediaFiles).length,
    removedMedia: missingFrom(previous.mediaFiles, current.mediaFiles),
    previousWouldBuyAgain:
      previous.wouldBuyAgain !== current.wouldBuyAgain ? previous.wouldBuyAgain : undefined,
    commentChanged: previous.comment.trim() !== current.comment.trim(),
  };
}
