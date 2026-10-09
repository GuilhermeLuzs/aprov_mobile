import type { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type SignUpStackParamList = {
  PersonalData: undefined;
  Password: undefined;
};

export type OnboardingStackParamList = {
  Interests: undefined;
  Companies: undefined;
  Discovery: undefined;
  Ready: undefined;
};

export type ProductDetailsParamList = {
  ProductDetails: { productId: string };
};

export type HomeStackParamList = ProductDetailsParamList & {
  Home: undefined;
  CompanyCatalog: { companyId: string };
};

export type ItemListKind = 'saved' | 'purchased';

export type ProfileStackParamList = ProductDetailsParamList & {
  Profile: undefined;
  Wallet: undefined;
  ItemList: { kind: ItemListKind };
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Login: undefined;
  SignUp: NavigatorScreenParams<SignUpStackParamList> | undefined;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList> | undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  CreateReview: { productId: string };
  MauricioChat: { productId: string };
};

export type HomeStackNavigation<T extends keyof HomeStackParamList> = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, T>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type ProfileStackNavigation<T extends keyof ProfileStackParamList> = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, T>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type ProductDetailsNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<ProductDetailsParamList, 'ProductDetails'>,
  NativeStackNavigationProp<RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
