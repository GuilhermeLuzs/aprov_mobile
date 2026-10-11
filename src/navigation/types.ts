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

export type FollowListKind = 'followers' | 'following';

export type PeopleParamList = {
  UserProfile: { userId: string };
  FollowList: { userId: string; kind: FollowListKind };
};

export type ReviewDetailsParamList = {
  ReviewDetails: { reviewId: string };
  ProductDetails: { productId: string };
};

export type HomeStackParamList = ProductDetailsParamList & PeopleParamList & {
  ReviewDetails: { reviewId: string };
  Home: undefined;
  CompanyCatalog: { companyId: string };
};

export type FeedStackParamList = ProductDetailsParamList & PeopleParamList & {
  ReviewDetails: { reviewId: string };
  Feed: undefined;
  PeopleSearch: undefined;
};

export type ItemListKind = 'saved' | 'purchased';

export type ProfileStackParamList = ProductDetailsParamList & PeopleParamList & {
  ReviewDetails: { reviewId: string };
  Profile: undefined;
  Wallet: undefined;
  ItemList: { kind: ItemListKind };
  EditProfile: undefined;
  Settings: undefined;
  EditInterests: undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  FeedTab: NavigatorScreenParams<FeedStackParamList>;
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

export type FeedStackNavigation<T extends keyof FeedStackParamList> = CompositeNavigationProp<
  NativeStackNavigationProp<FeedStackParamList, T>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type ProfileStackNavigation<T extends keyof ProfileStackParamList> = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, T>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type ProductDetailsNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<
    ProductDetailsParamList & ReviewDetailsParamList & PeopleParamList,
    'ProductDetails'
  >,
  NativeStackNavigationProp<RootStackParamList>
>;

export type ReviewDetailsNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<ReviewDetailsParamList & PeopleParamList, 'ReviewDetails'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type PeopleNavigation<T extends keyof PeopleParamList> = CompositeNavigationProp<
  NativeStackNavigationProp<PeopleParamList & ReviewDetailsParamList, T>,
  NativeStackNavigationProp<RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
