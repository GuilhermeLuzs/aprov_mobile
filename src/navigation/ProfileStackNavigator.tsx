import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  FollowListScreen,
  ItemListScreen,
  ProductDetailsScreen,
  ProfileScreen,
  ReviewDetailsScreen,
  UserProfileScreen,
  WalletScreen,
} from '../screens';
import type { ProfileStackParamList } from './types';
import { followListTitle, stackScreenOptions } from './navTheme';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Wallet" component={WalletScreen} options={{ title: 'Carteira' }} />
      <Stack.Screen name="ItemList" component={ItemListScreen} options={{ title: 'Itens' }} />
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
