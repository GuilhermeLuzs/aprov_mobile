import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  EditInterestsScreen,
  EditProfileScreen,
  FollowListScreen,
  ItemListScreen,
  ProductDetailsScreen,
  ProfileScreen,
  ReviewDetailsScreen,
  SettingsScreen,
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
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Editar perfil' }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configurações' }} />
      <Stack.Screen
        name="EditInterests"
        component={EditInterestsScreen}
        options={{ title: 'Meus interesses' }}
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
