import React, { useState } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TransactionProvider } from './src/context/TransactionContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { SplashScreen } from './src/components/SplashScreen';

import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);

  if (isShowSplash) {
    return <SplashScreen onFinish={() => setIsShowSplash(false)} />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <TransactionProvider>
            <AppNavigator />
          </TransactionProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
