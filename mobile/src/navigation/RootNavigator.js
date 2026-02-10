import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import DrawerNavigator from './DrawerNavigator';
import theme from '../constants/theme';

const RootNavigator = () => {
    const { token, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {token ? <DrawerNavigator /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default RootNavigator;
