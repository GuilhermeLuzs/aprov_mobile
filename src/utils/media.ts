import type { Media } from '../types';

export type PhotoSlide = { kind: 'photo'; uri: string; width: number; height: number };
export type VideoSlide = {
  kind: 'video';
  uri: string;
  thumbnailUri: string;
  durationSeconds: number;
};
export type MediaSlide = PhotoSlide | VideoSlide;

export type ReviewMediaSource = {
  id: string;
  kind: 'photo' | 'video';
  uri: string;
  thumbnailUri?: string;
  width: number;
  height: number;
  durationSeconds: number;
};

export function slidesOf(media: Media[]): MediaSlide[] {
  return media.flatMap((m): MediaSlide[] => {
    if (m.type === 'photo') {
      return [{ kind: 'photo', uri: m.uri, width: m.width, height: m.height }];
    }
    if (m.type === 'video') {
      return [
        {
          kind: 'video',
          uri: m.uri,
          thumbnailUri: m.thumbnailUri,
          durationSeconds: m.durationSeconds,
        },
      ];
    }
    return m.items.map((item) => ({
      kind: 'photo',
      uri: item.uri,
      width: item.width,
      height: item.height,
    }));
  });
}

export function toReviewMedia(media: ReviewMediaSource[]): Media[] {
  if (media.length === 0) return [];
  const photos = media.filter((m) => m.kind === 'photo');
  if (photos.length > 1 && photos.length === media.length) {
    return [
      {
        id: 'draft-carousel',
        type: 'carousel',
        items: photos.map((p) => ({ uri: p.uri, width: p.width, height: p.height })),
      },
    ];
  }
  const first = media[0];
  if (first.kind === 'video') {
    return [
      {
        id: first.id,
        type: 'video',
        uri: first.uri,
        thumbnailUri: first.thumbnailUri ?? '',
        durationSeconds: first.durationSeconds,
      },
    ];
  }
  return [{ id: first.id, type: 'photo', uri: first.uri, width: first.width, height: first.height }];
}
