import type { Product } from '../types';
import { extraProductMedia, MAX_PRODUCT_MEDIA } from './productMedia';
import { products as baseProducts, type ProductSeed } from './products';
import { reviews } from './reviews';

const MAIN_PHOTO_SIZE = 900;

function mediaOf(product: ProductSeed): Product['media'] {
  const main = {
    id: `${product.id}-m1`,
    type: 'photo' as const,
    uri: product.imageUri,
    width: MAIN_PHOTO_SIZE,
    height: MAIN_PHOTO_SIZE,
  };
  return [main, ...(extraProductMedia[product.id] ?? [])].slice(0, MAX_PRODUCT_MEDIA);
}

function withReviewStats(seed: ProductSeed): Product {
  const product: Product = { ...seed, media: mediaOf(seed) };
  const own = reviews.filter((r) => r.productId === product.id);
  if (own.length === 0) return { ...product, reviewCount: 0, averageRating: 0 };
  const average = own.reduce((sum, r) => sum + r.averageRating, 0) / own.length;
  return { ...product, reviewCount: own.length, averageRating: Math.round(average * 10) / 10 };
}

export const products: Product[] = baseProducts.map(withReviewStats);

export const productById: Record<string, Product> = Object.fromEntries(
  products.map((p) => [p.id, p]),
);
