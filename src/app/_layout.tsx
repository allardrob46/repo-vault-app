import { Stack } from 'expo-router';
import { ThemeProvider } from '@rneui/themed';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { theme, palette } from '../theme';
import { VaultProvider } from '../store';

export default function RootLayout() {
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
