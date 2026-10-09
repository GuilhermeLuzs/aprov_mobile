import { Image, Text, View } from 'react-native';
import { colors, radius, size as sizeToken, type } from '../theme';

export type AvatarSize = keyof typeof sizeToken.avatar;

type Props = {
  uri: string;
  name: string;
  size?: AvatarSize;
  bordered?: boolean;
};

const INITIAL_TEXT: Record<AvatarSize, { size: number; lineHeight: number }> = {
  sm: type.caption,
  md: type.subtitle,
  lg: type.display,
};

export function Avatar({ uri, name, size = 'md', bordered = false }: Props) {
  const px = sizeToken.avatar[size];
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <View
      style={{
        width: px,
        height: px,
        borderRadius: radius.pill,
        borderWidth: bordered ? sizeToken.avatarBorder : 0,
        borderColor: colors.primary,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: uri ? colors.surfaceAlt : colors.primaryDim,
      }}
      accessible
      accessibilityLabel={name}
    >
      {uri ? (
        <Image source={{ uri }} accessibilityIgnoresInvertColors style={{ width: '100%', height: '100%' }} />
      ) : (
        <Text
          style={{
            fontFamily: type.display.family,
            fontSize: INITIAL_TEXT[size].size,
            lineHeight: INITIAL_TEXT[size].lineHeight,
            color: colors.primary,
          }}
        >
          {initial}
        </Text>
      )}
    </View>
  );
}
