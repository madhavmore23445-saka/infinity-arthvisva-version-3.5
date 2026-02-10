import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <RootNavigator />
                <StatusBar style="auto" />
            </AuthProvider>
        </SafeAreaProvider>
    );
}
