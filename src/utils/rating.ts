import type { Product, Review } from '../types';

export type RatingStats = { reviewCount: number; averageRating: number };

export function ratingStats(reviews: Review[]): RatingStats {
  if (reviews.length === 0) return { reviewCount: 0, averageRating: 0 };
  const average = reviews.reduce((sum, r) => sum + r.averageRating, 0) / reviews.length;
  return { reviewCount: reviews.length, averageRating: Math.round(average * 10) / 10 };
}

export function withRatingStats(product: Product, reviews: Review[]): Product {
  return { ...product, ...ratingStats(reviews.filter((r) => r.productId === product.id)) };
}
