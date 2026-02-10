import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import theme from '../../constants/theme';

const StatCard = ({ icon, value, label, trend, trendColor, iconBg }) => (
    <View style={styles.statCard}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
            <MaterialCommunityIcons name={icon} size={28} color={theme.colors.white} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={styles.trendRow}>
            <Ionicons
                name={trend.includes('overdue') ? 'alert-circle' : 'arrow-up'}
                size={14}
                color={trendColor}
            />
            <Text style={[styles.trendText, { color: trendColor }]}>{trend}</Text>
        </View>
    </View>
);

const DashboardScreen = () => {
    const { user } = useAuth();

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Welcome Banner */}
                <View style={styles.welcomeBanner}>
                    <View style={styles.bannerContent}>
                        <Text style={styles.welcomeText}>Welcome back, {user?.name || 'Test'}.</Text>
                        <Text style={styles.snapshotText}>Here's a snapshot of your business performance.</Text>
                    </View>
                    <View style={styles.idBadge}>
                        <Text style={styles.idLabel}>ID: </Text>
                        <Text style={styles.idValue}>{user?.adv_id || 'ADV_2682'}</Text>
                    </View>
                </View>

                {/* Stat Cards */}
                <View style={styles.statsContainer}>
                    <StatCard
                        icon="chart-line"
                        value="0"
                        label="Total Business Volume"
                        trend="0% from last month"
                        trendColor={theme.colors.success}
                        iconBg="#3B82F6" // Bright Blue
                    />

                    <StatCard
                        icon="file-document-outline"
                        value="0"
                        label="Active Policies"
                        trend="0 new this month"
                        trendColor={theme.colors.success}
                        iconBg="#10B981" // Bright Green
                    />

                    <StatCard
                        icon="clock-outline"
                        value="0"
                        label="Pending Follow-ups"
                        trend="0 overdue"
                        trendColor={theme.colors.error}
                        iconBg="#F97316" // Bright Orange
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    welcomeBanner: {
        backgroundColor: '#0D9488', // Teal-ish solid for banner
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        position: 'relative',
        ...theme.shadow,
    },
    bannerContent: {
        marginBottom: 16,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.white,
        letterSpacing: -0.5,
    },
    snapshotText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 8,
        fontWeight: '500',
    },
    idBadge: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
    },
    idLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '600',
    },
    idValue: {
        fontSize: 12,
        color: theme.colors.white,
        fontWeight: '700',
    },
    statsContainer: {
        gap: 20,
        paddingBottom: 40,
    },
    statCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        padding: 24,
        ...theme.shadow,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    statValue: {
        fontSize: 32,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        fontWeight: '600',
        marginBottom: 12,
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    trendText: {
        fontSize: 12,
        fontWeight: '700',
    },
});

export default DashboardScreen;
