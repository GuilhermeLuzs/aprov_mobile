import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PasswordScreen, PersonalDataScreen } from '../screens';
import { SignUpProvider } from '../screens/SignUp/SignUpContext';
import type { SignUpStackParamList } from './types';
import { stackScreenOptions } from './navTheme';

const Stack = createNativeStackNavigator<SignUpStackParamList>();

export function SignUpNavigator() {
  return (
    <SignUpProvider>
      <Stack.Navigator
        screenOptions={{
          ...stackScreenOptions,
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="PersonalData" component={PersonalDataScreen} />
        <Stack.Screen name="Password" component={PasswordScreen} />
      </Stack.Navigator>
    </SignUpProvider>
  );
}
