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

function toggled(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function StepTags({ draft, update, product, rewards }: Props) {
  const tags = useItemTags(product.id).data ?? [];
  const selected = [...draft.positiveTagIds, ...draft.negativeTagIds];
  const blocked = (tag: Tag) => tag.oppositeId !== null && selected.includes(tag.oppositeId);
  const positive = tags.filter((t) => t.sentiment === 'positive');
  const negative = tags.filter((t) => t.sentiment === 'negative');

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
              disabled={blocked(t)}
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
              disabled={blocked(t)}
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
