import { StyleSheet, Text, View } from 'react-native';
import { Button, Checkbox, ReviewPost } from '../../../components';
import { colors, space, type } from '../../../theme';
import { currentUser, tagById } from '../../../mocks';
import {
  REVIEW_CHARACTERISTIC_KEYS,
  type Company,
  type Product,
  type Review,
} from '../../../types';
import { averageRating, mediaDone, toReviewMedia, type Draft } from '../draft';
import { StepHeading } from './StepHeading';

type Props = {
  draft: Draft;
  update: (patch: Partial<Draft>) => void;
  product: Product;
  company: Company;
};

function buildPreview(draft: Draft, product: Product): Review {
  return {
    id: 'preview',
    productId: product.id,
    companyId: product.companyId,
    authorId: currentUser.id,
    createdAt: new Date().toISOString(),
    editedAt: null,
    title: '',
    characteristics: REVIEW_CHARACTERISTIC_KEYS.map((key) => ({
      key,
      rating: draft.characteristics[key],
    })),
    averageRating: averageRating(draft),
    positiveTags: draft.positiveTagIds.map((id) => tagById[id]).filter(Boolean),
    negativeTags: draft.negativeTagIds.map((id) => tagById[id]).filter(Boolean),
    media: toReviewMedia(draft.media),
    comment: draft.comment,
    wouldBuyAgain: draft.wouldBuyAgain,
    agreements: 0,
    disagreements: 0,
    comments: [],
    commentCount: 0,
    shares: 0,
    coinsReward: product.coinsReward,
    xpReward: product.xpReward,
  };
}

export function StepPreview({ draft, update, product, company }: Props) {
  const question = product.kind === 'service' ? 'Contrataria novamente?' : 'Compraria novamente?';

  return (
    <View style={styles.wrap}>
      <StepHeading title="Prévia da avaliação" hint="É assim que ela vai aparecer para todos." />

      <ReviewPost
        review={buildPreview(draft, product)}
        author={currentUser}
        product={product}
        company={company}
      />

      {mediaDone(draft) ? (
        <Checkbox
          checked={draft.mediaConsent}
          onChange={(value) => update({ mediaConsent: value })}
          label="Autorizo compartilhar minhas fotos e vídeos com a empresa parceira."
        />
      ) : null}

      <View>
        <Text style={styles.question}>{question}</Text>
        <View style={styles.answers}>
          <View style={styles.answer}>
            <Button
              label="Não"
              variant={draft.wouldBuyAgain === false ? 'primary' : 'secondary'}
              fullWidth
              onPress={() => update({ wouldBuyAgain: false })}
            />
          </View>
          <View style={styles.answer}>
            <Button
              label="Sim"
              variant={draft.wouldBuyAgain === true ? 'primary' : 'secondary'}
              fullWidth
              onPress={() => update({ wouldBuyAgain: true })}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.lg },
  question: {
    marginBottom: space.sm,
    fontFamily: type.subtitle.family,
    fontSize: type.subtitle.size,
    lineHeight: type.subtitle.lineHeight,
    color: colors.ink,
  },
  answers: { flexDirection: 'row', gap: space.sm },
  answer: { flex: 1 },
});
