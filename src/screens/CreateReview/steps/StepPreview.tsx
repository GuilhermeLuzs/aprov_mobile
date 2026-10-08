import { StyleSheet, Text, View } from 'react-native';
import { Button, Checkbox, ReviewPost } from '../../../components';
import { colors, space, type } from '../../../theme';
import { useCurrentUser } from '../../../store/wallet';
import type { Company, Product } from '../../../types';
import { buildReview, mediaDone, type Draft } from '../draft';
import { StepHeading } from './StepHeading';

type Props = {
  draft: Draft;
  update: (patch: Partial<Draft>) => void;
  product: Product;
  company: Company;
};

export function StepPreview({ draft, update, product, company }: Props) {
  const me = useCurrentUser();
  const question = product.kind === 'service' ? 'Contrataria novamente?' : 'Compraria novamente?';

  return (
    <View style={styles.wrap}>
      <StepHeading title="Prévia da avaliação" hint="É assim que ela vai aparecer para todos." />

      <ReviewPost
        review={buildReview(draft, product, 'preview')}
        author={me}
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
