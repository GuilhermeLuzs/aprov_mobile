import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CompanyCatalogScreen, HomeScreen } from '../screens';
import { companies } from '../mocks';
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
        options={({ route }) => ({
          title: companies.find((c) => c.id === route.params.companyId)?.name ?? 'Catálogo',
        })}
      />
    </Stack.Navigator>
  );
}
