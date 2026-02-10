import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import theme from '../../constants/theme';

const HomeLoanScreen = () => (
    <ScrollView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Home loan</Text>
            <Text style={styles.subtitle}>Welcome to your client portfolio</Text>
        </View>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>products  ------home loan</Text>
            <Text style={styles.cardBody}>No recent activity found.</Text>
        </View>
    </ScrollView>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.lg,
    },
    header: {
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },
    card: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        ...theme.shadow,
    },
    cardTitle: {
        ...theme.typography.h3,
        marginBottom: theme.spacing.sm,
    },
    cardBody: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    }
});



export default HomeLoanScreen;
