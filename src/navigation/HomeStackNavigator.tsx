import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens';
import type { HomeStackParamList } from './types';
import { stackScreenOptions } from './navTheme';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
