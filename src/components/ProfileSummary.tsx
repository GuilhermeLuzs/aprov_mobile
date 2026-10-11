import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Award } from 'lucide-react-native';
import { colors, space, type } from '../theme';
import type { User } from '../types';
import { formatInt } from '../utils/format';
import { Avatar } from './Avatar';
import { Chip } from './Chip';
import { SectionHeader } from './SectionHeader';

type Props = {
  user: User;
  level: number;
  reviews: number;
  agreements: number;
  followers: number;
  following: number;
  onPressFollowers: () => void;
  onPressFollowing: () => void;
  emptyBadgesText: string;
  children?: ReactNode;
};

export function ProfileSummary({
  user,
  level,
  reviews,
  agreements,
  followers,
  following,
  onPressFollowers,
  onPressFollowing,
  emptyBadgesText,
  children,
}: Props) {
  return (
    <View>
      <View style={styles.identity}>
        <Avatar uri={user.avatarUri} name={user.name} size="lg" bordered />
        <View style={styles.identityText}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.levelLabel}>Nível {level}</Text>
        </View>
      </View>

      {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

      {children}

      <View style={styles.stats}>
        <Stat value={reviews} label={reviews === 1 ? 'avaliação' : 'avaliações'} />
        <Stat
          value={agreements}
          label={agreements === 1 ? 'concordância recebida' : 'concordâncias recebidas'}
        />
        <Stat
          value={followers}
          label={followers === 1 ? 'seguidor' : 'seguidores'}
          onPress={onPressFollowers}
        />
        <Stat value={following} label="seguindo" onPress={onPressFollowing} />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Badges" />
        {user.badges.length > 0 ? (
          <View style={styles.badges}>
            {user.badges.map((badge) => (
              <Chip
                key={badge.id}
                label={badge.label}
                icon={Award}
                size="sm"
                accessibilityLabel={`${badge.label}: ${badge.description}`}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyLine}>{emptyBadgesText}</Text>
        )}
      </View>
    </View>
  );
}

function Stat({ value, label, onPress }: { value: number; label: string; onPress?: () => void }) {
  const content = (
    <Text style={styles.statText}>
      <Text style={styles.statNumber}>{formatInt(value)}</Text> {label}
    </Text>
  );
  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={space.sm}
      accessibilityRole="button"
      accessibilityLabel={`${formatInt(value)} ${label}, ver lista`}
      style={({ pressed }) => pressed && styles.statPressed}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  identityText: { flex: 1 },
  name: {
    fontFamily: type.title.family,
    fontSize: type.title.size,
    lineHeight: type.title.lineHeight,
    color: colors.ink,
  },
  levelLabel: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  bio: {
    marginTop: space.md,
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
  stats: {
    marginTop: space.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: space.lg,
    rowGap: space.xs,
  },
  statText: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkMuted,
  },
  statNumber: {
    fontFamily: type.numeric.family,
    color: colors.ink,
  },
  statPressed: { opacity: 0.6 },
  section: { marginTop: space.xl },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  emptyLine: {
    fontFamily: type.body.family,
    fontSize: type.body.size,
    lineHeight: type.body.lineHeight,
    color: colors.inkFaint,
  },
});
