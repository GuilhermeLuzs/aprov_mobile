import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { navTheme, stackScreenOptions } from './navTheme';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { CreateReviewScreen } from '../screens';

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  showOnboarding?: boolean;
};

export function RootNavigator({ showOnboarding = true }: Props) {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={stackScreenOptions}>
        {showOnboarding && (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingNavigator}
            options={{ headerShown: false }}
          />
        )}
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateReview"
          component={CreateReviewScreen}
          options={{ headerShown: false, presentation: 'fullScreenModal', gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
