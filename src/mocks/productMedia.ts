import type { Media } from '../types';
import { photo, video } from './media';

export const MAX_PRODUCT_MEDIA = 6;

export const extraProductMedia: Record<string, Media[]> = {
  p01: [
    photo('p01-m2', 'aprov-p01-b'),
    photo('p01-m3', 'aprov-p01-c'),
    video('p01-m4', 'aprov-p01-v', 'joyrides'),
  ],
  p04: [photo('p04-m2', 'aprov-p04-b'), video('p04-m3', 'aprov-p04-v', 'blazes')],
  p06: [photo('p06-m2', 'aprov-p06-b'), photo('p06-m3', 'aprov-p06-c')],
  p11: [
    photo('p11-m2', 'aprov-p11-b'),
    photo('p11-m3', 'aprov-p11-c'),
    photo('p11-m4', 'aprov-p11-d'),
  ],
  p16: [video('p16-m2', 'aprov-p16-v', 'escapes'), photo('p16-m3', 'aprov-p16-b')],
  p21: [photo('p21-m2', 'aprov-p21-b'), photo('p21-m3', 'aprov-p21-c')],
  p25: [video('p25-m2', 'aprov-p25-v', 'meltdowns')],
  p30: [
    photo('p30-m2', 'aprov-p30-b'),
    photo('p30-m3', 'aprov-p30-c'),
    photo('p30-m4', 'aprov-p30-d'),
    video('p30-m5', 'aprov-p30-v', 'fun'),
  ],
};
