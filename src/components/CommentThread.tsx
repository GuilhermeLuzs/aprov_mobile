import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Flag } from 'lucide-react-native';
import { colors, icon, radius, space, type } from '../theme';
import type { Comment, CommentReply, User } from '../types';
import { formatRelativeTime } from '../utils/date';
import { Avatar } from './Avatar';
import { VoteBar, type VoteState } from './VoteBar';

type Props = {
  comment: Comment;
  authorFor: (userId: string) => User | undefined;
  voteFor: (entryId: string) => VoteState;
  canVote: (authorId: string) => boolean;
  onVote: (entryId: string, choice: 'agree' | 'disagree') => void;
  onReply: (comment: Comment) => void;
  onPressAuthor?: (authorId: string) => void;
  canReport?: (authorId: string) => boolean;
  onReport?: (entryId: string) => void;
};

export function CommentThread({
  comment,
  authorFor,
  voteFor,
  canVote,
  onVote,
  onReply,
  onPressAuthor,
  canReport,
  onReport,
}: Props) {
  const entryProps = { authorFor, voteFor, canVote, onVote, onPressAuthor, canReport, onReport };

  return (
    <View style={styles.card}>
      <Entry entry={comment} {...entryProps} onReply={() => onReply(comment)} />
      {comment.replies.length > 0 ? (
        <View style={styles.replies}>
          {comment.replies.map((reply) => (
            <Entry key={reply.id} entry={reply} {...entryProps} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

type EntryProps = Omit<Props, 'comment' | 'onReply'> & {
  entry: Comment | CommentReply;
  onReply?: () => void;
};

function Entry({
  entry,
  authorFor,
  voteFor,
  canVote,
  onVote,
  onReply,
  onPressAuthor,
  canReport,
  onReport,
}: EntryProps) {
  const author = authorFor(entry.authorId);
  const name = author?.name ?? 'Usuário';
  const votable = canVote(entry.authorId);

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onPressAuthor?.(entry.authorId)}
        disabled={!onPressAuthor}
        accessibilityRole={onPressAuthor ? 'link' : undefined}
        accessibilityLabel={onPressAuthor ? `Ver perfil de ${name}` : undefined}
      >
        <Avatar uri={author?.avatarUri ?? ''} name={name} size="sm" />
      </Pressable>
      <View style={styles.body}>
        <View style={styles.head}>
          <Text
            style={styles.name}
            numberOfLines={1}
            onPress={onPressAuthor ? () => onPressAuthor(entry.authorId) : undefined}
            accessibilityRole={onPressAuthor ? 'link' : undefined}
          >
            {name}
          </Text>
          <Text style={styles.time} numberOfLines={1}>
            {formatRelativeTime(entry.createdAt)}
          </Text>
          {onReport && canReport?.(entry.authorId) ? (
            <Pressable
              onPress={() => onReport(entry.id)}
              hitSlop={space.sm}
              accessibilityRole="button"
              accessibilityLabel={`Denunciar comentário de ${name}`}
              style={styles.menu}
            >
              <Flag size={icon.size.sm} color={colors.inkMuted} strokeWidth={icon.strokeWidth} />
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.text}>{entry.text}</Text>
        <View style={styles.actions}>
          <VoteBar
            size="sm"
            agreements={entry.agreements}
            disagreements={entry.disagreements}
            active={voteFor(entry.id)}
            onAgree={votable ? () => onVote(entry.id, 'agree') : undefined}
            onDisagree={votable ? () => onVote(entry.id, 'disagree') : undefined}
          />
          {onReply ? (
            <Pressable
              onPress={onReply}
              hitSlop={space.sm}
              accessibilityRole="button"
              accessibilityLabel={`Responder a ${name}`}
            >
              {({ pressed }) => (
                <Text style={[styles.reply, pressed && styles.replyPressed]}>Responder</Text>
              )}
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: space.lg,
    gap: space.md,
  },
  replies: {
    gap: space.md,
    marginLeft: space.sm,
    paddingLeft: space.lg,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
  row: { flexDirection: 'row', gap: space.sm },
  body: { flex: 1, gap: space.xs },
  head: { flexDirection: 'row', alignItems: 'baseline', gap: space.xs },
  name: {
    flexShrink: 1,
    fontFamily: type.bodyBold.family,
    fontSize: type.bodyBold.size,
    lineHeight: type.bodyBold.lineHeight,
    color: colors.ink,
  },
  menu: { marginLeft: 'auto', alignSelf: 'center' },
  time: {
    flexShrink: 0,
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  text: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.ink,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  reply: {
    fontFamily: type.bodyBold.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.primary,
  },
  replyPressed: { opacity: 0.6 },
});
