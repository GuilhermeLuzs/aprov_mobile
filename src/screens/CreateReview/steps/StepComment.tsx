import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { MauricioBubble } from '../../../components';
import { colors, icon, radius, size, space, type } from '../../../theme';
import type { Product } from '../../../types';
import { COMMENT_MAX_LENGTH, type Draft } from '../draft';
import { contextualQuestion } from '../mauricio';
import { StepHeading } from './StepHeading';

type Props = {
  draft: Draft;
  update: (patch: Partial<Draft>) => void;
  product: Product;
  bonus: string;
  onOpenChat: () => void;
};

export function StepComment({ draft, update, product, bonus, onOpenChat }: Props) {
  const noun = product.kind === 'service' ? 'contratar esse serviço' : 'comprar esse produto';

  return (
    <View style={styles.wrap}>
      <StepHeading title="Conte com suas palavras" bonus={bonus} />

      <View>
        <MauricioBubble text={contextualQuestion(draft)} mascotSize={56} />
        <Pressable
          style={styles.chatLink}
          onPress={onOpenChat}
          hitSlop={space.sm}
          accessibilityRole="link"
          accessibilityLabel="Converse com o Maurício"
        >
          {({ pressed }) => (
            <View style={[styles.chatLinkRow, pressed && styles.pressed]}>
              <MessageCircle size={icon.size.sm} color={colors.primary} strokeWidth={icon.strokeWidth} />
              <Text style={styles.chatLinkText}>Converse com o Maurício</Text>
            </View>
          )}
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        value={draft.comment}
        onChangeText={(text) => update({ comment: text.slice(0, COMMENT_MAX_LENGTH) })}
        placeholder={`O que as outras pessoas precisam saber antes de ${noun}?`}
        placeholderTextColor={colors.inkFaint}
        multiline
        maxLength={COMMENT_MAX_LENGTH}
        textAlignVertical="top"
      />
      <Text style={styles.counter}>
        {draft.comment.length}/{COMMENT_MAX_LENGTH}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.lg },
  chatLink: { alignSelf: 'flex-end', marginTop: space.sm },
  chatLinkRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  pressed: { opacity: 0.6 },
  chatLinkText: {
    fontFamily: type.bodyBold.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  input: {
    minHeight: size.textArea,
    padding: space.md,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.ink,
  },
  counter: {
    alignSelf: 'flex-end',
    marginTop: -space.sm,
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
});
