import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '@rneui/themed';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { theme, palette } from '../theme';
import { VaultProvider } from '../store';

// Keep the native splash up until the first screen is actually mounted,
// then hide it ourselves. The default auto-hide never fired on Rob's
// phone — the app sat on the logo — so the hide is explicit now.
// Nothing async is waited on here: the home screen shows its own
// "Opening the vault…" state while storage loads.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <VaultProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: palette.ink },
              animation: 'slide_from_right',
            }}
          />
        </VaultProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
