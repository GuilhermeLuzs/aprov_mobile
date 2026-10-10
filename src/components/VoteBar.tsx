import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-react-native';
import { colors, icon as iconToken, space, type } from '../theme';
import { formatInt } from '../utils/format';

export type VoteState = 'agree' | 'disagree' | null;

type Props = {
  agreements: number;
  disagreements: number;
  comments?: number;
  size?: 'sm' | 'md';
  active?: VoteState;
  onAgree?: () => void;
  onDisagree?: () => void;
  onComments?: () => void;
};

export function VoteBar({
  agreements,
  disagreements,
  comments,
  size = 'md',
  active = null,
  onAgree,
  onDisagree,
  onComments,
}: Props) {
  const px = size === 'sm' ? iconToken.size.sm : iconToken.size.md;

  return (
    <View style={styles.row}>
      <Metric
        Icon={ThumbsUp}
        color={colors.agree}
        px={px}
        count={agreements}
        selected={active === 'agree'}
        label={`${formatInt(agreements)} concordâncias`}
        actionLabel={active === 'agree' ? 'Desfazer concordância' : 'Concordar'}
        onPress={onAgree}
      />
      <Metric
        Icon={ThumbsDown}
        color={colors.disagree}
        px={px}
        count={disagreements}
        selected={active === 'disagree'}
        label={`${formatInt(disagreements)} discordâncias`}
        actionLabel={active === 'disagree' ? 'Desfazer discordância' : 'Discordar'}
        onPress={onDisagree}
      />
      {comments != null ? (
        <Metric
          Icon={MessageCircle}
          color={colors.inkMuted}
          px={px}
          count={comments}
          label={`${formatInt(comments)} comentários`}
          actionLabel="Ver comentários"
          onPress={onComments}
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
  selected?: boolean;
  label: string;
  actionLabel: string;
  onPress?: () => void;
};

function Metric({ Icon, color, px, count, selected = false, label, actionLabel, onPress }: MetricProps) {
  const content = (
    <>
      <Icon
        size={px}
        color={color}
        fill={selected ? color : 'transparent'}
        strokeWidth={iconToken.strokeWidth}
      />
      <Text style={[styles.count, selected && { color }]}>{formatInt(count)}</Text>
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
      hitSlop={space.sm}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${actionLabel}, ${label}`}
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
    minHeight: space.xl,
  },
  count: {
    fontFamily: type.numeric.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
});
