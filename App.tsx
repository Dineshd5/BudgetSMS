import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TransactionProvider } from './src/context/TransactionContext';
import { StatusBar, useColorScheme } from 'react-native';

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

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
