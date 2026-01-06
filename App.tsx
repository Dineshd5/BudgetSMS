import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TransactionProvider } from './src/context/TransactionContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <TransactionProvider>
        <AppNavigator />
      </TransactionProvider>
    </SafeAreaProvider>
  );
}
