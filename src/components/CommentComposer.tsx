import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SendHorizontal, X } from 'lucide-react-native';
import { colors, icon, radius, size, space, type } from '../theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  replyingTo?: string;
  onCancelReply?: () => void;
  maxLength: number;
};

export function CommentComposer({
  value,
  onChangeText,
  onSend,
  replyingTo,
  onCancelReply,
  maxLength,
}: Props) {
  const insets = useSafeAreaInsets();
  const canSend = value.trim() !== '';

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom + space.sm }]}>
      {replyingTo ? (
        <View style={styles.replying}>
          <Text style={styles.replyingText} numberOfLines={1}>
            Respondendo a <Text style={styles.replyingName}>{replyingTo}</Text>
          </Text>
          <Pressable
            onPress={onCancelReply}
            hitSlop={space.sm}
            accessibilityRole="button"
            accessibilityLabel="Cancelar resposta"
          >
            <X size={icon.size.md} color={colors.inkMuted} strokeWidth={icon.strokeWidth} />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={replyingTo ? 'Escreva uma resposta...' : 'Escreva um comentário...'}
          placeholderTextColor={colors.inkFaint}
          maxLength={maxLength}
          multiline
          accessibilityLabel={replyingTo ? `Resposta para ${replyingTo}` : 'Comentário'}
        />
        <Pressable
          onPress={onSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel={replyingTo ? 'Enviar resposta' : 'Enviar comentário'}
          style={[styles.send, !canSend && styles.sendDisabled]}
        >
          <SendHorizontal size={icon.size.md} color={colors.surface} strokeWidth={icon.strokeWidth} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: space.sm,
    paddingTop: space.sm,
    paddingHorizontal: space.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  replying: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  replyingText: {
    flex: 1,
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  replyingName: { fontFamily: type.bodyBold.family, color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  input: {
    flex: 1,
    minHeight: size.control,
    maxHeight: size.textArea,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.control,
    backgroundColor: colors.surfaceAlt,
    fontFamily: type.body.family,
    fontSize: type.body.size,
    color: colors.ink,
  },
  send: {
    width: size.control,
    height: size.control,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  sendDisabled: { backgroundColor: colors.inkFaint },
});
