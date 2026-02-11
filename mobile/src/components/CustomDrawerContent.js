import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager, Dimensions } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import theme from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Only enable LayoutAnimation on Android if not using New Architecture
if (Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental &&
    !global.RN$Fabric) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

const CustomDrawerContent = (props) => {
    const { user, logout, fetchUserProfile } = useAuth();
    const insets = useSafeAreaInsets();

    // Default open sections: Dashboard and Products
    const [expandedSections, setExpandedSections] = useState({
        products: false,
        dashboard: true,
        secondary: false,
    });

    // Fix: Fetch user profile on mount to ensure data is fresh and visible
    useEffect(() => {
        fetchUserProfile();
    }, []);

    const toggleSection = (section) => {
        // Custom efficient animation config
        LayoutAnimation.configureNext(LayoutAnimation.create(250, 'easeInEaseOut', 'opacity'));
        setExpandedSections({
            ...expandedSections,
            [section]: !expandedSections[section],
        });
    };

    const renderHeader = () => (
        <TouchableOpacity
            onPress={() => props.navigation.navigate('Profile')}
            activeOpacity={0.9}
            style={styles.headerContainer}
        >
            <LinearGradient
                colors={['#E0F2FE', '#FFFFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
            >
                <View style={styles.profileRow}>
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={theme.colors.buttonGradient}
                            style={styles.avatarGradient}
                        >
                            <Text style={styles.avatarText}>{user?.role?.charAt(0)?.toUpperCase() || 'U'}</Text>
                        </LinearGradient>
                        <View style={styles.onlineBadge} />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName} numberOfLines={1}>
                            {user?.name || user?.adv_id || 'Welcome User'}
                        </Text>
                        <View style={styles.roleContainer}>
                            <Text style={styles.userRole}>{user?.adv_id || 'Advisor'}</Text>
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={12} color={theme.colors.success} />
                            </View>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    const renderMenuItem = (label, icon, onPress, isSubItem = false, key) => (
        <TouchableOpacity
            key={key}
            style={[styles.menuItem, isSubItem && styles.subMenuItem]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.menuIconBox, isSubItem && styles.subMenuIconBox]}>
                <Ionicons
                    name={icon}
                    size={isSubItem ? 18 : 20}
                    color={isSubItem ? theme.colors.textSecondary : theme.colors.brandBlue}
                />
            </View>
            <Text style={[styles.menuText, isSubItem && styles.subMenuText]}>{label}</Text>
        </TouchableOpacity>
    );

    const renderCollapsibleSection = (title, icon, sectionKey, items) => {
        const isOpen = expandedSections[sectionKey];
        return (
            <View style={styles.sectionContainer}>
                <TouchableOpacity
                    style={[styles.sectionHeader, isOpen && styles.sectionHeaderActive]}
                    onPress={() => toggleSection(sectionKey)}
                    activeOpacity={0.8}
                >
                    <View style={styles.sectionTitleRow}>
                        <LinearGradient
                            colors={isOpen ? theme.colors.buttonGradient : ['#F1F5F9', '#F8FAFC']}
                            style={styles.iconBox}
                        >
                            <Ionicons
                                name={icon}
                                size={18}
                                color={isOpen ? theme.colors.white : theme.colors.textSecondary}
                            />
                        </LinearGradient>
                        <Text style={[styles.sectionTitle, isOpen && styles.sectionTitleActive]}>{title}</Text>
                    </View>
                    <View style={[styles.chevronBox, isOpen && styles.chevronBoxActive]}>
                        <Ionicons
                            name={isOpen ? "chevron-up" : "chevron-down"}
                            size={16}
                            color={isOpen ? theme.colors.brandBlue : theme.colors.textSecondary}
                        />
                    </View>
                </TouchableOpacity>

                {isOpen && (
                    <View style={styles.subItemsContainer}>
                        <View style={styles.connectorLine} />
                        <View style={styles.subItemsList}>
                            {items.map((item, index) => (
                                renderMenuItem(
                                    item.label,
                                    item.icon,
                                    () => props.navigation.navigate(item.screen),
                                    true,
                                    `${sectionKey}-${index}`
                                )
                            ))}
                        </View>
                    </View>
                )}
            </View>
        );
    };

    const dashboardItems = [
        { label: 'Dashboard', icon: 'grid-outline', screen: 'Dashboard' },
        { label: 'Lead Management', icon: 'people-outline', screen: 'LeadManagement' },
        { label: 'Client Portfolio', icon: 'briefcase-outline', screen: 'ClientPortfolio' },
    ];

    const productsItems = [
        { label: 'Home Loan', icon: 'home-outline', screen: 'HomeLoan' },
        { label: 'Car Loan', icon: 'car-outline', screen: 'CarLoan' },
        { label: 'Insurance', icon: 'shield-checkmark-outline', screen: 'Insurance' },
        { label: 'Mutual Fund', icon: 'trending-up-outline', screen: 'MutualFund' },
        { label: 'Investment', icon: 'wallet-outline', screen: 'Investment' },
    ];

    const secondaryItems = [
        { label: 'Incentives & Payouts', icon: 'cash-outline', screen: 'Incentives' },
        { label: 'Marketing Campaign', icon: 'megaphone-outline', screen: 'Marketing' },
        { label: 'Downloads', icon: 'download-outline', screen: 'Downloads' },
    ];

    return (
        <View style={styles.container}>
            {renderHeader()}

            <DrawerContentScrollView
                {...props}
                contentContainerStyle={styles.drawerContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.menuContainer}>
                    {renderCollapsibleSection('Dashboard', 'apps-outline', 'dashboard', dashboardItems)}
                    {renderCollapsibleSection('Products', 'cube-outline', 'products', productsItems)}
                    {renderCollapsibleSection('Growth', 'rocket-outline', 'secondary', secondaryItems)}
                </View>
            </DrawerContentScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
                    <View style={styles.logoutIconBox}>
                        <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
                    </View>
                    <Text style={styles.logoutText}>Sign Out from App</Text>
                </TouchableOpacity>
                <Text style={styles.versionText}>v3.1.0 • Built for Excellence</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerContainer: {
        marginBottom: 10,
    },
    headerGradient: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatarGradient: {
        width: 56,
        height: 56,
        borderRadius: 20, // Squircle shape
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.brandBlue,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    avatarText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
    },
    onlineBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 16,
        height: 16,
        backgroundColor: theme.colors.success,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.secondary,
        marginBottom: 4,
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    userRole: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.textSecondary,
    },
    verifiedBadge: {
        marginLeft: 2,
    },
    drawerContent: {
        paddingTop: 10,
        paddingBottom: 20,
    },
    menuContainer: {
        paddingHorizontal: 16,
        gap: 16,
    },
    sectionContainer: {
        backgroundColor: '#FFFFFF',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 1,
        marginBottom: 2,
    },
    sectionHeaderActive: {
        // We handle active styles in the children
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chevronBox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chevronBoxActive: {
        backgroundColor: '#EFF6FF',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    sectionTitleActive: {
        color: theme.colors.secondary,
        fontWeight: '700',
    },
    subItemsContainer: {
        flexDirection: 'row',
        marginTop: 4,
    },
    connectorLine: {
        width: 2,
        backgroundColor: '#E2E8F0',
        marginLeft: 18, // Align with center of parent icon
        marginRight: 24,
        borderRadius: 1,
    },
    subItemsList: {
        flex: 1,
        gap: 6,
        paddingBottom: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#F8FAFC', // Subtle card for subitems
        gap: 12,
        // Optional: Add shadow for floating feel
    },
    subMenuItem: {
        // Specific styles for sub items if needed override
    },
    menuIconBox: {
        // If we want icons with background
    },
    subMenuIconBox: {
        width: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.textSecondary,
    },
    subMenuText: {
        color: theme.colors.text,
        fontWeight: '500',
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        backgroundColor: '#FFFFFF',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        gap: 12,
        marginBottom: 16,
    },
    logoutIconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.error,
    },
    versionText: {
        fontSize: 12,
        color: '#94A3B8',
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default CustomDrawerContent;
