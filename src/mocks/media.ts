import type { CarouselMedia, PhotoMedia, VideoMedia } from '../types';

const SAMPLE_VIDEO_BASE = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample';

const SAMPLE_CLIPS = {
  joyrides: { file: 'ForBiggerJoyrides.mp4', durationSeconds: 15 },
  blazes: { file: 'ForBiggerBlazes.mp4', durationSeconds: 15 },
  escapes: { file: 'ForBiggerEscapes.mp4', durationSeconds: 15 },
  meltdowns: { file: 'ForBiggerMeltdowns.mp4', durationSeconds: 15 },
  fun: { file: 'ForBiggerFun.mp4', durationSeconds: 60 },
} as const;

export type SampleClip = keyof typeof SAMPLE_CLIPS;

const PHOTO_SIZE = 1080;

export const photo = (id: string, seed: string): PhotoMedia => ({
  id,
  type: 'photo',
  uri: `https://picsum.photos/seed/${seed}/${PHOTO_SIZE}/${PHOTO_SIZE}`,
  width: PHOTO_SIZE,
  height: PHOTO_SIZE,
});

export const video = (id: string, seed: string, clip: SampleClip): VideoMedia => ({
  id,
  type: 'video',
  uri: `${SAMPLE_VIDEO_BASE}/${SAMPLE_CLIPS[clip].file}`,
  thumbnailUri: `https://picsum.photos/seed/${seed}/1080/1920`,
  durationSeconds: SAMPLE_CLIPS[clip].durationSeconds,
});

export const carousel = (id: string, seeds: string[]): CarouselMedia => ({
  id,
  type: 'carousel',
  items: seeds.map((s) => ({
    uri: `https://picsum.photos/seed/${s}/${PHOTO_SIZE}/${PHOTO_SIZE}`,
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
  })),
});
