import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Award } from 'lucide-react-native';
import { Button, MauricioMascot, RewardAmount } from '../../components';
import { colors, radius, size, space, type } from '../../theme';
import { currentUser } from '../../mocks';
import { formatInt } from '../../utils/format';
import type { Company } from '../../types';
import type { Rewards } from './rewards';

type Props = {
  company: Company;
  rewards: Rewards;
  onViewReview: () => void;
  onReviewAnother: () => void;
};

export function Conclusion({ company, rewards, onViewReview, onReviewAnother }: Props) {
  const insets = useSafeAreaInsets();

  const span = Math.max(1, currentUser.xpLevelCeiling - currentUser.xpLevelFloor);
  const progress = Math.min(1, (currentUser.xp + rewards.xp - currentUser.xpLevelFloor) / span);
  const toNextLevel = Math.max(0, currentUser.xpLevelCeiling - currentUser.xp - rewards.xp);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.hero}>
        <MauricioMascot size={120} />
        <Text style={styles.title}>Avaliação publicada!</Text>

        <View style={styles.rewards}>
          <RewardAmount amount={rewards.coins} label={company.coinName} tone="onBrand" />
          <RewardAmount amount={rewards.points} label="pontos APROV" icon={Award} tone="onBrand" />
        </View>

        <View style={styles.level}>
          <Text style={styles.levelTitle}>Nível {currentUser.level}</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.levelText}>
            +{formatInt(rewards.xp)} XP · faltam {formatInt(toNextLevel)} XP para o próximo nível
          </Text>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <Button
          label="Ver minha avaliação"
          tone="onBrand"
          fullWidth
          onPress={onViewReview}
        />
        <Button
          label="Avaliar outro item"
          variant="text"
          tone="onBrand"
          fullWidth
          onPress={onReviewAnother}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primaryBright },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  title: {
    marginTop: space.xl,
    fontFamily: type.display.family,
    fontSize: type.display.size,
    lineHeight: type.display.lineHeight,
    color: colors.surface,
    textAlign: 'center',
  },
  rewards: {
    marginTop: space.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.xl,
  },
  level: {
    marginTop: space.xl,
    alignSelf: 'stretch',
    gap: space.sm,
  },
  levelTitle: {
    textAlign: 'center',
    fontFamily: type.subtitle.family,
    fontSize: type.subtitle.size,
    lineHeight: type.subtitle.lineHeight,
    color: colors.surface,
  },
  track: {
    height: size.progressBar,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryPress,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.value,
  },
  levelText: {
    textAlign: 'center',
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.valueDim,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.sm,
  },
});
