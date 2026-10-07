import { tagById } from '../../mocks';
import {
  REVIEW_CHARACTERISTIC_KEYS,
  type ReviewCharacteristicKey,
} from '../../types';
import type { Draft } from './draft';

const LOW_RATING = 2;

const LOW_RATING_QUESTION: Record<ReviewCharacteristicKey, string> = {
  entrega: 'A entrega foi o ponto fraco. O que deu errado?',
  qualidade: 'A qualidade decepcionou. Conta o que faltou.',
  conformidade: 'Veio diferente do anunciado? Conta o que não bateu.',
  custo_beneficio: 'Achou caro pelo que recebeu? Explica o porquê.',
};

function lowestRated(draft: Draft) {
  const rated = REVIEW_CHARACTERISTIC_KEYS.map((key) => ({ key, value: draft.characteristics[key] }))
    .filter((c) => c.value > 0);
  if (rated.length === 0) return null;
  return rated.reduce((a, b) => (b.value < a.value ? b : a));
}

export function contextualQuestion(draft: Draft): string {
  const lowest = lowestRated(draft);
  if (lowest && lowest.value <= LOW_RATING) return LOW_RATING_QUESTION[lowest.key];
  const negative = draft.negativeTagIds.map((id) => tagById[id]).filter(Boolean)[0];
  if (negative) return `Você marcou "${negative.label}". Pode contar como foi?`;
  const positive = draft.positiveTagIds.map((id) => tagById[id]).filter(Boolean)[0];
  if (positive) return `Você marcou "${positive.label}". Conta uma situação em que isso apareceu.`;
  return 'Como foi a sua experiência no dia a dia?';
}
