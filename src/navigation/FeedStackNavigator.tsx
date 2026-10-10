import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FeedScreen, ProductDetailsScreen, ReviewDetailsScreen } from '../screens';
import type { FeedStackParamList } from './types';
import { stackScreenOptions } from './navTheme';

const Stack = createNativeStackNavigator<FeedStackParamList>();

export function FeedStackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Feed" component={FeedScreen} options={{ headerShown: false }} />
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
    </Stack.Navigator>
  );
}
