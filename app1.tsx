import React, { JSX } from 'react';
import MainDrawer from './app/Components/MainDrawer'; 
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App(): JSX.Element {
  return (
    <SafeAreaProvider>
      <MainDrawer />
    </SafeAreaProvider>
  );
}

export default App;


