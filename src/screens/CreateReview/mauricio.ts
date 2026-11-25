import { mauricioReplies, mauricioFallbacks } from '../../mocks';
import {
  REVIEW_CHARACTERISTIC_KEYS,
  REVIEW_CHARACTERISTIC_LABEL,
  type Tag,
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

const GENERAL_QUESTION = 'Como foi a sua experiência no dia a dia?';

export function contextualQuestions(draft: Draft, tags: Tag[]): string[] {
  const lowRated = REVIEW_CHARACTERISTIC_KEYS.map((key) => ({ key, value: draft.characteristics[key] }))
    .filter((c) => c.value > 0 && c.value <= LOW_RATING)
    .sort((a, b) => a.value - b.value)
    .map((c) => LOW_RATING_QUESTION[c.key]);

  const selected = (ids: string[]) =>
    ids.map((id) => tags.find((tag) => tag.id === id)).filter((tag): tag is Tag => tag !== undefined);

  const negatives = selected(draft.negativeTagIds).map(
    (tag) => `Você marcou "${tag.label}". Pode contar como foi?`,
  );
  const positives = selected(draft.positiveTagIds).map(
    (tag) => `Você marcou "${tag.label}". Conta uma situação em que isso apareceu.`,
  );

  const questions = [...lowRated, ...negatives, ...positives];
  return questions.length > 0 ? questions : [GENERAL_QUESTION];
}

export function greeting(draft: Draft, tags: Tag[]): string {
  return `Oi, eu sou o Maurício! Tô aqui pra te ajudar a escrever uma avaliação que ajude de verdade. ${contextualQuestions(draft, tags)[0]}`;
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
