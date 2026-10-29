import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { fontMap } from './src/theme';
import { RootNavigator } from './src/navigation';
import { restoreSession } from './src/store/session';

void SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontMap);
  const [restored, setRestored] = useState<boolean | null>(null);
  const [navReady, setNavReady] = useState(false);

  useEffect(() => {
    restoreSession().then(setRestored, () => setRestored(false));
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && restored !== null) {
      setNavReady(true);
    }
  }, [fontsLoaded, fontError, restored]);

  const onLayout = useCallback(() => {
    if (navReady) {
      void SplashScreen.hideAsync();
    }
  }, [navReady]);

  if (!navReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
      <SafeAreaProvider>
        <View style={{ flex: 1 }}>
          <StatusBar style="dark" />
          <RootNavigator initialRoute={restored ? 'MainTabs' : 'Login'} />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
