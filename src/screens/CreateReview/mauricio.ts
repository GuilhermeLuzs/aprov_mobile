import { mauricioReplies, mauricioFallbacks, tagById } from '../../mocks';
import {
  REVIEW_CHARACTERISTIC_KEYS,
  REVIEW_CHARACTERISTIC_LABEL,
  type ReviewCharacteristicKey,
} from '../../types';
import { normalizeForSearch } from '../../utils/search';
import type { Draft } from './draft';

const LOW_RATING = 2;

const LOW_RATING_QUESTION: Record<ReviewCharacteristicKey, string> = {
  entrega: 'A entrega foi o ponto fraco. O que deu errado?',
  qualidade: 'A qualidade decepcionou. Conta o que faltou.',
  conformidade: 'Veio diferente do anunciado? Conta o que não bateu.',
  custo_beneficio: 'Achou caro pelo que recebeu? Explica o porquê.',
};

const RATING_KEYWORDS = ['nota', 'estrela', 'avaliei'];

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

export function greeting(draft: Draft): string {
  return `Oi, eu sou o Maurício! Tô aqui pra te ajudar a escrever uma avaliação que ajude de verdade. ${contextualQuestion(draft)}`;
}

function ratingReply(draft: Draft): string | null {
  const lowest = lowestRated(draft);
  if (!lowest) return null;
  return `Sua menor nota foi ${lowest.value} em ${REVIEW_CHARACTERISTIC_LABEL[lowest.key]}. Conte o que aconteceu: é isso que mais ajuda quem vai comprar.`;
}

function mentions(text: string, words: string[], keyword: string): boolean {
  return keyword.includes(' ') ? text.includes(keyword) : words.some((w) => w.startsWith(keyword));
}

export function replyTo(message: string, draft: Draft, turn: number): string {
  const text = normalizeForSearch(message).replace(/[^\p{L}\p{N}\s]/gu, ' ');
  const words = text.split(/\s+/).filter(Boolean);

  if (RATING_KEYWORDS.some((k) => mentions(text, words, k))) {
    const reply = ratingReply(draft);
    if (reply) return reply;
  }

  const match = mauricioReplies.find((r) => r.keywords.some((k) => mentions(text, words, k)));
  if (match) return match.answer;

  return mauricioFallbacks[turn % mauricioFallbacks.length];
}
