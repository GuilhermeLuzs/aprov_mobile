import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  CompaniesScreen,
  DiscoveryScreen,
  InterestsScreen,
  ReadyScreen,
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
        <Stack.Screen name="Discovery" component={DiscoveryScreen} />
        <Stack.Screen name="Ready" component={ReadyScreen} />
      </Stack.Navigator>
    </OnboardingProvider>
  );
}
