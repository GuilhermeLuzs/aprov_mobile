import { StyleSheet, Text, View } from 'react-native';
import { StarRating } from '../../../components';
import { colors, space, type } from '../../../theme';
import {
  REVIEW_CHARACTERISTIC_DESCRIPTION,
  REVIEW_CHARACTERISTIC_KEYS,
  REVIEW_CHARACTERISTIC_LABEL,
  type Product,
} from '../../../types';
import type { Draft } from '../draft';
import { StepHeading } from './StepHeading';

type Props = {
  draft: Draft;
  update: (patch: Partial<Draft>) => void;
  product: Product;
  bonus: string;
};

export function StepStars({ draft, update, product, bonus }: Props) {
  return (
    <View style={styles.wrap}>
      <StepHeading
        title={product.kind === 'service' ? 'Avalie o serviço' : 'Avalie o produto'}
        bonus={bonus}
      />

      {REVIEW_CHARACTERISTIC_KEYS.map((key) => (
        <View key={key} style={styles.row}>
          <Text style={styles.label}>{REVIEW_CHARACTERISTIC_LABEL[key]}</Text>
          <Text style={styles.description}>{REVIEW_CHARACTERISTIC_DESCRIPTION[key]}</Text>
          <View style={styles.stars}>
            <StarRating
              value={draft.characteristics[key]}
              size="lg"
              onChange={(value) =>
                update({ characteristics: { ...draft.characteristics, [key]: value } })
              }
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xl },
  row: { gap: space.xs },
  label: {
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.ink,
  },
  description: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  stars: { marginTop: space.xs },
});
