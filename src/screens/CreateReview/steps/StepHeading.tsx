import { StyleSheet, Text, View } from 'react-native';
import { Circle, CircleCheck } from 'lucide-react-native';
import { colors, icon, space, type } from '../../../theme';
import type { StepReward } from '../rewards';

type Props = {
  title: string;
  hint?: string;
  rewards?: StepReward[];
};

export function StepHeading({ title, hint, rewards }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {rewards && rewards.length > 0 ? (
        <View style={styles.rewards}>
          {rewards.map((reward) => {
            const Mark = reward.done ? CircleCheck : Circle;
            return (
              <View key={reward.id} style={styles.rewardRow}>
                <Mark
                  size={icon.size.sm}
                  color={reward.done ? colors.agree : colors.inkFaint}
                  strokeWidth={icon.strokeWidth}
                />
                <Text style={[styles.rule, reward.done && styles.ruleDone]}>{reward.rule}</Text>
                <Text style={[styles.amount, reward.done && styles.amountDone]}>{reward.amount}</Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  title: {
    fontFamily: type.title.family,
    fontSize: type.title.size,
    lineHeight: type.title.lineHeight,
    color: colors.ink,
  },
  hint: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  rewards: { gap: space.xs, marginTop: space.xs },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  rule: {
    flex: 1,
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  ruleDone: { color: colors.ink },
  amount: {
    fontFamily: type.numeric.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkFaint,
  },
  amountDone: { color: colors.valueDeep },
});
