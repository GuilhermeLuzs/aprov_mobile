import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  CompanyCatalogScreen,
  FollowListScreen,
  HomeScreen,
  ProductDetailsScreen,
  ReviewDetailsScreen,
  UserProfileScreen,
} from '../screens';
import type { HomeStackParamList } from './types';
import { followListTitle, stackScreenOptions } from './navTheme';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="CompanyCatalog"
        component={CompanyCatalogScreen}
        options={{ title: 'Catálogo' }}
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
