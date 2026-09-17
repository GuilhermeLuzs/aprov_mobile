import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  MessageCircle,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react-native';
import { colors, icon as iconToken, space, type } from '../theme';
import { formatInt } from '../utils/format';

type Props = {
  agreements: number;
  disagreements: number;
  comments?: number;
  shares?: number;
  size?: 'sm' | 'md';
  onAgree?: () => void;
  onDisagree?: () => void;
  onComments?: () => void;
  onShare?: () => void;
};

export function VoteBar({
  agreements,
  disagreements,
  comments,
  shares,
  size = 'md',
  onAgree,
  onDisagree,
  onComments,
  onShare,
}: Props) {
  const px = size === 'sm' ? iconToken.size.sm : iconToken.size.md;

  return (
    <View style={styles.row}>
      <Metric
        Icon={ThumbsUp}
        color={colors.agree}
        px={px}
        count={agreements}
        label={`${formatInt(agreements)} concordâncias`}
        onPress={onAgree}
      />
      <Metric
        Icon={ThumbsDown}
        color={colors.disagree}
        px={px}
        count={disagreements}
        label={`${formatInt(disagreements)} discordâncias`}
        onPress={onDisagree}
      />
      {comments != null ? (
        <Metric
          Icon={MessageCircle}
          color={colors.inkMuted}
          px={px}
          count={comments}
          label={`${formatInt(comments)} comentários`}
          onPress={onComments}
        />
      ) : null}
      {shares != null ? (
        <Metric
          Icon={Share2}
          color={colors.inkMuted}
          px={px}
          count={shares}
          label={`${formatInt(shares)} compartilhamentos`}
          onPress={onShare}
        />
      ) : null}
    </View>
  );
}

type MetricProps = {
  Icon: typeof ThumbsUp;
  color: string;
  px: number;
  count: number;
  label: string;
  onPress?: () => void;
};

function Metric({ Icon, color, px, count, label, onPress }: MetricProps) {
  const content = (
    <>
      <Icon size={px} color={color} strokeWidth={iconToken.strokeWidth} />
      <Text style={styles.count}>{formatInt(count)}</Text>
    </>
  );

  if (!onPress) {
    return (
      <View style={styles.metric} accessible accessibilityLabel={label}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      style={styles.metric}
      hitSlop={8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: 24,
  },
  count: {
    fontFamily: type.numeric.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
});
