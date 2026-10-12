import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Award } from 'lucide-react-native';
import { colors, radius, space, type } from '../theme';
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

      <View style={styles.stats}>
        <Stat value={reviews} label={reviews === 1 ? 'avaliação' : 'avaliações'} />
        <Stat value={agreements} label={agreements === 1 ? 'concordância' : 'concordâncias'} />
        <Stat
          value={followers}
          label={followers === 1 ? 'seguidor' : 'seguidores'}
          onPress={onPressFollowers}
        />
        <Stat value={following} label="seguindo" onPress={onPressFollowing} />
      </View>

      {children}


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
    <>
      <Text style={styles.statNumber}>{formatInt(value)}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </>
  );
  if (!onPress) {
    return (
      <View style={styles.stat} accessible accessibilityLabel={`${formatInt(value)} ${label}`}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${formatInt(value)} ${label}, ver lista`}
      style={({ pressed }) => [styles.stat, pressed && styles.statPressed]}
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
    paddingVertical: space.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  stat: {
    flexGrow: 1,
    flexShrink: 0,
    alignItems: 'center',
    paddingHorizontal: space.xs,
    paddingVertical: space.xs,
    borderRadius: radius.control,
  },
  statNumber: {
    fontFamily: type.numeric.family,
    fontSize: type.title.size,
    lineHeight: type.title.lineHeight,
    color: colors.ink,
  },
  statLabel: {
    fontFamily: type.caption.family,
    fontSize: type.caption.size,
    lineHeight: type.caption.lineHeight,
    color: colors.inkMuted,
  },
  statPressed: { backgroundColor: colors.surfaceAlt },
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
