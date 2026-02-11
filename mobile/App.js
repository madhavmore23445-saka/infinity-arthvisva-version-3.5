import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';

import toastConfig from './src/config/toastConfig.js';

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <RootNavigator />
                <StatusBar style="auto" />
            </AuthProvider>

            {/* Toast must be mounted once at root */}
           <Toast config={toastConfig} />

        </SafeAreaProvider>
    );
}
