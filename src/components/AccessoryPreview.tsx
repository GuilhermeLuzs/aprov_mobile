import { StyleSheet, View } from 'react-native';
import { size } from '../theme';
import type { Accessory, User } from '../types';
import { Avatar } from './Avatar';
import { MauricioMascot } from './MauricioMascot';
import type { MauricioMood } from './mauricioArt';

type Props = {
  accessory: Accessory;
  user: User;
  variant: 'card' | 'sheet';
  mood?: MauricioMood;
};

export function AccessoryPreview({ accessory, user, variant, mood = 'neutral' }: Props) {
  const height = size.accessoryPreview[variant];

  return (
    <View style={[styles.box, { height }]}>
      {accessory.kind === 'skin' ? (
        <MauricioMascot skin={accessory.skin} mood={mood} size={height} />
      ) : (
        <Avatar
          uri={user.avatarUri}
          name={user.name}
          size={variant === 'card' ? 'lg' : 'xl'}
          frame={accessory.frame}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
});
