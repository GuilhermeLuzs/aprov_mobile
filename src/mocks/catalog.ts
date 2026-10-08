import type { Product } from '../types';
import { products as baseProducts } from './products';
import { reviews } from './reviews';

function withReviewStats(product: Product): Product {
  const own = reviews.filter((r) => r.productId === product.id);
  if (own.length === 0) return { ...product, reviewCount: 0, averageRating: 0 };
  const average = own.reduce((sum, r) => sum + r.averageRating, 0) / own.length;
  return { ...product, reviewCount: own.length, averageRating: Math.round(average * 10) / 10 };
}

export const products: Product[] = baseProducts.map(withReviewStats);

export const productById: Record<string, Product> = Object.fromEntries(
  products.map((p) => [p.id, p]),
);
