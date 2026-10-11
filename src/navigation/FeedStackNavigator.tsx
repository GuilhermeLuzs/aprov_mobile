import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  FeedScreen,
  FollowListScreen,
  PeopleSearchScreen,
  ProductDetailsScreen,
  ReviewDetailsScreen,
  UserProfileScreen,
} from '../screens';
import type { FeedStackParamList } from './types';
import { followListTitle, stackScreenOptions } from './navTheme';

const Stack = createNativeStackNavigator<FeedStackParamList>();

export function FeedStackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Feed" component={FeedScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="PeopleSearch"
        component={PeopleSearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{ title: 'Detalhes' }}
      />
      <Stack.Screen
        name="ReviewDetails"
        component={ReviewDetailsScreen}
        options={{ title: 'Avaliação' }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ title: 'Perfil' }}
      />
      <Stack.Screen
        name="FollowList"
        component={FollowListScreen}
        options={({ route }) => ({ title: followListTitle(route.params.kind) })}
      />
    </Stack.Navigator>
  );
}
