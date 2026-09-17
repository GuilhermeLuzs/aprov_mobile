import type { NavigatorScreenParams } from '@react-navigation/native';

export type OnboardingStackParamList = {
  Interests: undefined;
  Companies: undefined;
  Goal: undefined;
  NotificationsPermission: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
};

export type RootStackParamList = {
  Onboarding: NavigatorScreenParams<OnboardingStackParamList> | undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
