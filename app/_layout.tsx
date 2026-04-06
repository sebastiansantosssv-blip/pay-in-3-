import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/providers/AuthProvider';
import { OnboardingProvider } from '../src/providers/OnboardingProvider';
import { UserProvider } from '../src/providers/UserProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans: require('../assets/fonts/DMSans-Regular.ttf'),
    'DMSans_300Light': require('../assets/fonts/DMSans-Light.ttf'),
    'DMSans_500Medium': require('../assets/fonts/DMSans-Medium.ttf'),
    'DMSans_600SemiBold': require('../assets/fonts/DMSans-SemiBold.ttf'),
    'DMSans_700Bold': require('../assets/fonts/DMSans-Bold.ttf'),
    DMMono: require('../assets/fonts/DMMono-Regular.ttf'),
    'DMMono_500Medium': require('../assets/fonts/DMMono-Medium.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <UserProvider>
        <OnboardingProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="settings" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          </Stack>
        </OnboardingProvider>
      </UserProvider>
    </AuthProvider>
  );
}
