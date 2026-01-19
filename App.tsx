import React, { useState } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TransactionProvider } from './src/context/TransactionContext';
import { StatusBar, useColorScheme } from 'react-native';
import { SplashScreen } from './src/components/SplashScreen';

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);

  if (isShowSplash) {
    return <SplashScreen onFinish={() => setIsShowSplash(false)} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        translucent={false}
        barStyle="dark-content"
        backgroundColor="#ffffff"
      />
      <TransactionProvider>
        <AppNavigator />
      </TransactionProvider>
    </SafeAreaProvider>
  );
}
