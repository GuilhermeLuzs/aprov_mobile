import { DefaultTheme, type Theme } from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { colors, space, type } from '../theme';
import type { FollowListKind } from './types';

export const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.surface,
    text: colors.ink,
    border: colors.border,
    notification: colors.primary,
  },
};

export const stackScreenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.ink,
  headerTitleStyle: {
    fontFamily: type.subtitle.family,
    fontSize: type.subtitle.size,
  },
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
  contentStyle: { backgroundColor: colors.bg },
};

export function followListTitle(kind: FollowListKind): string {
  return kind === 'followers' ? 'Seguidores' : 'Seguindo';
}

export const modalTopInset = space.xl;
