import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  CompaniesScreen,
  GoalScreen,
  InterestsScreen,
  NotificationsPermissionScreen,
} from '../screens';
import { OnboardingProvider } from '../screens/Onboarding/OnboardingContext';
import type { OnboardingStackParamList } from './types';
import { stackScreenOptions } from './navTheme';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <OnboardingProvider>
      <Stack.Navigator
        screenOptions={{
          ...stackScreenOptions,
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Interests" component={InterestsScreen} />
        <Stack.Screen name="Companies" component={CompaniesScreen} />
        <Stack.Screen name="Goal" component={GoalScreen} />
        <Stack.Screen
          name="NotificationsPermission"
          component={NotificationsPermissionScreen}
        />
      </Stack.Navigator>
    </OnboardingProvider>
  );
}
