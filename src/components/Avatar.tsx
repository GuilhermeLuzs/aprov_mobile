import { Image, View } from 'react-native';
import { colors, radius, size as sizeToken } from '../theme';

export type AvatarSize = keyof typeof sizeToken.avatar;

type Props = {
  uri: string;
  name: string;
  size?: AvatarSize;
  bordered?: boolean;
};

export function Avatar({ uri, name, size = 'md', bordered = false }: Props) {
  const px = sizeToken.avatar[size];

  return (
    <View
      style={{
        width: px,
        height: px,
        borderRadius: radius.pill,
        borderWidth: bordered ? sizeToken.avatarBorder : 0,
        borderColor: colors.primary,
        overflow: 'hidden',
        backgroundColor: colors.surfaceAlt,
      }}
      accessible
      accessibilityLabel={name}
    >
      <Image source={{ uri }} accessibilityIgnoresInvertColors style={{ flex: 1 }} />
    </View>
  );
}
