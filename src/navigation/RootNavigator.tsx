import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { navTheme, stackScreenOptions } from './navTheme';
import { OnboardingNavigator } from './OnboardingNavigator';
import { SignUpNavigator } from './SignUpNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import {
  CreateReviewScreen,
  LoginScreen,
  MauricioChatScreen,
  MediaViewerScreen,
  ProductMediaScreen,
} from '../screens';

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = { initialRoute: 'Login' | 'MainTabs' };

export function RootNavigator({ initialRoute }: Props) {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={stackScreenOptions} initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpNavigator} options={{ headerShown: false }} />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingNavigator}
          options={{ headerShown: false }}
        />
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
        <Stack.Screen
          name="MauricioChat"
          component={MauricioChatScreen}
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="MediaViewer"
          component={MediaViewerScreen}
          options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'fade' }}
        />
        <Stack.Screen
          name="ProductMedia"
          component={ProductMediaScreen}
          options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'fade' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
