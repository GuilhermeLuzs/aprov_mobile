import type { RewardTopicStatus } from '../../types';

export type Rewards = { coins: number; points: number; xp: number };

export type StepReward = { id: string; rule: string; amount: string; done: boolean };

const STEP_TOPICS: Record<number, string[]> = {
  2: ['min_tags'],
  3: ['min_valid_photos', 'sent_video'],
  4: ['min_comment_length', 'coherent_comment'],
  5: ['completed_review'],
};

function ruleText(topic: RewardTopicStatus): string {
  const n = topic.threshold ?? 1;
  switch (topic.topic) {
    case 'min_tags':
      return n > 1 ? `Marque ${n} tags ou mais` : 'Marque uma tag';
    case 'min_valid_photos':
      return n > 1 ? `Mande ${n} fotos ou mais` : 'Mande uma foto';
    case 'sent_video':
      return 'Mande um vídeo';
    case 'min_comment_length':
      return `Escreva ${n} caracteres ou mais`;
    case 'coherent_comment':
      return 'Fale sobre as tags que marcou (conferido ao publicar)';
    case 'completed_review':
      return 'Preencha estrelas, tags e comentário';
    default:
      return topic.topic;
  }
}

export function stepRewards(topics: RewardTopicStatus[], step: number, coinName: string): StepReward[] {
  const keys = STEP_TOPICS[step] ?? [];
  return keys
    .map((key) => topics.find((t) => t.topic === key))
    .filter((t): t is RewardTopicStatus => t !== undefined && t.coins > 0)
    .map((t) => ({ id: t.topic, rule: ruleText(t), amount: `+${t.coins} ${coinName}`, done: t.satisfied }));
}
