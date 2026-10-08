import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CompanyCatalogScreen, HomeScreen, ProductDetailsScreen } from '../screens';
import type { HomeStackParamList } from './types';
import { stackScreenOptions } from './navTheme';

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
    </Stack.Navigator>
  );
}
