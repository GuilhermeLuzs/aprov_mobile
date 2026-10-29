import { companies } from '../mocks/companies';
import { products } from '../mocks/products';
import { tags } from '../mocks/tags';

const ITEM_ID_BY_MOCK: Record<string, number> = Object.fromEntries(products.map((p, i) => [p.id, i + 1]));
const TAG_ID_BY_MOCK: Record<string, number> = Object.fromEntries(tags.map((t, i) => [t.id, i + 1]));

export function realItemId(mockId: string): number {
  return ITEM_ID_BY_MOCK[mockId];
}

export function realTagIds(mockIds: string[]): number[] {
  return mockIds.map((id) => TAG_ID_BY_MOCK[id]);
}

export function mockItemId(realId: number): string | undefined {
  return products[realId - 1]?.id;
}

export function mockTagId(realId: number): string | undefined {
  return tags[realId - 1]?.id;
}

export function mockCompanyId(realId: number): string | undefined {
  return companies[realId - 1]?.id;
}
