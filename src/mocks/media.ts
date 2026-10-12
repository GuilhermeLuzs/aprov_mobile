import type { CarouselMedia, PhotoMedia, VideoMedia } from '../types';
import { stockPhoto } from './stockPhotos';
import { stockVideo } from './stockVideos';

const PHOTO_SIZE = 1080;
const VIDEO_THUMB_WIDTH = 1080;
const VIDEO_THUMB_HEIGHT = 1920;

export const photo = (id: string, seed: string): PhotoMedia => ({
  id,
  type: 'photo',
  uri: stockPhoto(seed, PHOTO_SIZE, PHOTO_SIZE),
  width: PHOTO_SIZE,
  height: PHOTO_SIZE,
});

export const video = (id: string, key: string): VideoMedia => ({
  id,
  type: 'video',
  ...stockVideo(key, VIDEO_THUMB_WIDTH, VIDEO_THUMB_HEIGHT),
});

export const carousel = (id: string, seeds: string[]): CarouselMedia => ({
  id,
  type: 'carousel',
  items: seeds.map((s) => ({
    uri: stockPhoto(s, PHOTO_SIZE, PHOTO_SIZE),
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
  })),
});
