import type { Media } from '../types';

export type PhotoSlide = { kind: 'photo'; uri: string; width: number; height: number };
export type VideoSlide = {
  kind: 'video';
  uri: string;
  thumbnailUri: string;
  durationSeconds: number;
};
export type MediaSlide = PhotoSlide | VideoSlide;

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
