import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ItemListScreen, ProductDetailsScreen, ProfileScreen, WalletScreen } from '../screens';
import type { ProfileStackParamList } from './types';
import { stackScreenOptions } from './navTheme';

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
    </Stack.Navigator>
  );
}
