import { StyleSheet, View } from 'react-native';
import { Chip, SectionHeader } from '../../../components';
import { space } from '../../../theme';
import { useItemTags } from '../../../queries/catalog';
import type { Product, Tag } from '../../../types';
import type { Draft } from '../draft';
import type { StepReward } from '../rewards';
import { StepHeading } from './StepHeading';

type Props = {
  draft: Draft;
  update: (patch: Partial<Draft>) => void;
  product: Product;
  rewards: StepReward[];
};

const NEUTRAL_RATING = 3;

function toggled(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function StepTags({ draft, update, product, rewards }: Props) {
  const ratingFor = (tag: Tag) => draft.characteristics[tag.characteristic] || NEUTRAL_RATING;

  const forCategory = useItemTags(product.id).data ?? [];
  const positive = forCategory
    .filter((t) => t.sentiment === 'positive')
    .sort((a, b) => ratingFor(b) - ratingFor(a));
  const negative = forCategory
    .filter((t) => t.sentiment === 'negative')
    .sort((a, b) => ratingFor(a) - ratingFor(b));

  return (
    <View style={styles.wrap}>
      <StepHeading title="Destaque o que marcou" hint="Marque pelo menos uma tag." rewards={rewards} />

      <View>
        <SectionHeader title="O que foi bom?" />
        <View style={styles.tags}>
          {positive.map((t) => (
            <Chip
              key={t.id}
              label={t.label}
              variant="positive"
              selected={draft.positiveTagIds.includes(t.id)}
              onPress={() => update({ positiveTagIds: toggled(draft.positiveTagIds, t.id) })}
            />
          ))}
        </View>
      </View>

      <View>
        <SectionHeader title="O que podemos melhorar?" />
        <View style={styles.tags}>
          {negative.map((t) => (
            <Chip
              key={t.id}
              label={t.label}
              variant="negative"
              selected={draft.negativeTagIds.includes(t.id)}
              onPress={() => update({ negativeTagIds: toggled(draft.negativeTagIds, t.id) })}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xl },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
});
