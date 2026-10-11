import { FlatList, StyleSheet, View } from 'react-native';
import { BottomSheet, CommentComposer, CommentThread, EmptyState } from '../../components';
import { space } from '../../theme';
import type { Review } from '../../types';
import { formatInt } from '../../utils/format';
import { COMMENT_MAX_LENGTH, useReviewComments } from '../ReviewDetails/useReviewComments';
import { useReport } from '../Report/useReport';

type Props = {
  review: Review | undefined;
  onClose: () => void;
};

export function CommentsSheet({ review, onClose }: Props) {
  const comments = useReviewComments(review);
  const report = useReport();

  return (
    <BottomSheet
      visible={review !== undefined}
      title={`Comentários · ${formatInt(comments.total)}`}
      closeLabel="Fechar comentários"
      onClose={onClose}
      tall
    >
      <FlatList
        data={comments.thread}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <CommentThread
            comment={item}
            authorFor={comments.authorFor}
            voteFor={comments.voteFor}
            canVote={comments.canVote}
            onVote={comments.vote}
            onReply={comments.setReplyingTo}
            canReport={report.canReport}
            onReport={(id) => report.open('comment', id)}
          />
        )}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <EmptyState
            compact
            title="Nenhum comentário ainda"
            description="Seja a primeira pessoa a comentar."
          />
        }
        keyboardShouldPersistTaps="handled"
      />
      <CommentComposer
        value={comments.draft}
        onChangeText={comments.setDraft}
        onSend={comments.send}
        replyingTo={comments.replyingToName}
        onCancelReply={() => comments.setReplyingTo(null)}
        maxLength={COMMENT_MAX_LENGTH}
      />
      {report.sheet}
    </BottomSheet>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  list: { padding: space.lg },
  separator: { height: space.md },
});
