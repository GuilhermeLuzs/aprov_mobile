export type MediaType = 'photo' | 'video' | 'carousel';

export interface CarouselItem {
  uri: string;
  width: number;
  height: number;
}

export interface PhotoMedia {
  id: string;
  type: 'photo';
  uri: string;
  width: number;
  height: number;
}

export interface VideoMedia {
  id: string;
  type: 'video';
  uri: string;
  thumbnailUri: string;
  durationSeconds: number;
}

export interface CarouselMedia {
  id: string;
  type: 'carousel';
  items: CarouselItem[];
}

export type Media = PhotoMedia | VideoMedia | CarouselMedia;
