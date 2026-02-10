import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    Dimensions,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import theme from '../constants/theme';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
    const { user, logout, fetchUserProfile } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchProfile = async () => {
        try {
            setError(null);
            const result = await fetchUserProfile();
            if (result.success && result.user) {
                setProfileData(result.user);
            } else {
                setError(result.message || 'Failed to fetch profile data');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Error connecting to server');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user) {
            setProfileData(user);
        }
        setLoading(true);
        fetchProfile();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProfile();
    };

    const InfoRow = ({ icon, label, value, isLast, iconLib = 'Ionicons' }) => {
        const IconComponent = iconLib === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
        return (
            <View style={[styles.infoRow, isLast && { borderBottomWidth: 0 }]}>
                <View style={styles.infoIconContainer}>
                    <IconComponent name={icon} size={20} color="#2076C7" />
                </View>
                <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{label}</Text>
                    <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
                </View>
                {/* Subtle detail indicator */}
                <View style={styles.valueDot} />
            </View>
        );
    };

    const SettingAction = ({ icon, label, onPress, color = '#334155', isLast, danger }) => (
        <TouchableOpacity
            style={[styles.settingAction, isLast && { borderBottomWidth: 0 }]}
            onPress={onPress}
            activeOpacity={0.6}
        >
            <View style={[styles.actionIconBox, danger && { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name={icon} size={22} color={danger ? '#EF4444' : color} />
            </View>
            <Text style={[styles.actionLabel, { color: danger ? '#EF4444' : color }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={18} color={danger ? '#FCA5A5' : '#CBD5E1'} />
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2076C7" />
                <Text style={styles.loadingText}>Synchronizing Profile...</Text>
            </View>
        );
    }

    const displayUser = profileData || user;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />
                }
            >
                {/* Elite Header with Deep Gradient and Patterns */}
                <LinearGradient
                    colors={['#134E4A', '#1CADA3', '#2076C7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.eliteHeader}
                >
                    <SafeAreaView edges={['top']}>
                        <View style={styles.topBar}>
                            <View>
                                <Text style={styles.topBarTitle}>PROFILE</Text>
                                <View style={styles.activeStatus}>
                                    <View style={styles.statusDot} />
                                    <Text style={styles.statusText}>Live Now</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.premiumEditIcon}>
                                <MaterialCommunityIcons name="shield-edit-outline" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.heroProfile}>
                            <View style={styles.avatarMaster}>
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.2)']}
                                    style={styles.avatarRing}
                                >
                                    <View style={styles.avatarInner}>
                                        <Text style={styles.avatarInitials}>
                                            {displayUser?.name?.charAt(0).toUpperCase() || 'U'}
                                        </Text>
                                    </View>
                                </LinearGradient>
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                                </View>
                            </View>

                            <View style={styles.nameSection}>
                                <Text style={styles.heroName}>{displayUser?.name || 'Partner Name'}</Text>
                                <View style={styles.idContainer}>
                                    <MaterialCommunityIcons name="identifier" size={14} color="rgba(255,255,255,0.7)" />
                                    <Text style={styles.heroId}>{displayUser?.adv_id || 'ID-OFFLINE'}</Text>
                                </View>
                            </View>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                {/* Floating Analytics Bar (Glassmorphic) */}
                <View style={styles.analyticsWrapper}>
                    <LinearGradient
                        colors={['rgba(255,255,255,1)', 'rgba(248,250,252,0.95)']}
                        style={styles.analyticsBar}
                    >
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>24</Text>
                            <Text style={styles.statLabel}>Total Leads</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>Gold</Text>
                            <Text style={styles.statLabel}>Partner Tier</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>12 %</Text>
                            <Text style={styles.statLabel}>Growth</Text>
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.contentBody}>
                    <View style={styles.sectionHeader}>
                        <LinearGradient
                            colors={['rgba(32, 118, 199, 0.1)', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.sectionHeaderLine}
                        />
                        <Text style={styles.sectionLabel}>IDENTITY & CONTACT</Text>
                    </View>

                    <View style={styles.premiumCard}>
                        <InfoRow
                            icon="person-circle-outline"
                            label="Legal Name"
                            value={displayUser?.name}
                        />
                        <InfoRow
                            icon="mail-open-outline"
                            label="Professional Email"
                            value={displayUser?.email}
                        />
                        <InfoRow
                            icon="phone-portrait-outline"
                            label="Direct Line"
                            value={displayUser?.mobile || displayUser?.phone}
                        />
                        <InfoRow
                            icon="finger-print-outline"
                            label="Official ID (PAN)"
                            value={displayUser?.pan}
                        />
                        <InfoRow
                            icon="location-outline"
                            label="Primary City"
                            value={displayUser?.city}
                            isLast
                        />
                    </View>

                    <View style={styles.sectionHeader}>
                        <LinearGradient
                            colors={['rgba(28, 173, 163, 0.1)', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.sectionHeaderLine}
                        />
                        <Text style={styles.sectionLabel}>PROFESSIONAL SCOPE</Text>
                    </View>

                    <View style={styles.premiumCard}>
                        <InfoRow
                            icon="briefcase-variant-outline"
                            label="Reporting Unit"
                            value={displayUser?.head}
                            iconLib="MaterialCommunityIcons"
                        />
                        <InfoRow
                            icon="view-grid-plus-outline"
                            label="Service Portfolio"
                            value={displayUser?.category}
                            iconLib="MaterialCommunityIcons"
                        />
                        <InfoRow
                            icon="calendar-check-outline"
                            label="Vesting Period Starts"
                            value={displayUser?.date_joined ? new Date(displayUser.date_joined).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Pending'}
                            isLast
                            iconLib="MaterialCommunityIcons"
                        />
                    </View>

                    <View style={styles.sectionHeader}>
                        <LinearGradient
                            colors={['rgba(239, 68, 68, 0.05)', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.sectionHeaderLine}
                        />
                        <Text style={styles.sectionLabel}>PREFERENCES & SECURITY</Text>
                    </View>

                    <View style={styles.premiumCard}>
                        <SettingAction icon="notifications-circle-outline" label="Push Notifications" onPress={() => { }} />
                        <SettingAction icon="shield-checkmark-outline" label="Security & Biometrics" onPress={() => { }} />
                        <SettingAction icon="help-buoy-outline" label="Support Concierge" onPress={() => { }} />
                    </View>

                    <View style={styles.dangerZone}>
                        <TouchableOpacity style={styles.logoutPremiumBtn} activeOpacity={0.8} onPress={logout}>
                            <View style={styles.logoutIconCircle}>
                                <Ionicons name="log-out-outline" size={24} color="#FFF" />
                            </View>
                            <View>
                                <Text style={styles.logoutTextMain}>Disconnect Account</Text>
                                <Text style={styles.logoutTextSub}>Securely sign out of your session</Text>
                            </View>
                            <Ionicons name="power-outline" size={20} color="#FCA5A5" style={styles.powerIcon} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.versionInfo}>
                        <Text style={styles.versionText}>INFINITY ARTHVISVA v3.2</Text>
                        <Text style={styles.copyrightText}>© 2026 Infinity Inc. All Rights Reserved.</Text>
                    </View>

                    <View style={styles.footerGhost} />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        flexGrow: 1,
    },
    eliteHeader: {
        paddingTop: 10,
        paddingBottom: 60,
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
        overflow: 'hidden',
        ...theme.shadow,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 28,
        paddingVertical: 15,
    },
    topBarTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 2,
    },
    activeStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4ADE80',
        marginRight: 6,
    },
    statusText: {
        fontSize: 11,
        color: '#FFF',
        fontWeight: '700',
    },
    premiumEditIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    heroProfile: {
        alignItems: 'center',
        marginTop: 15,
    },
    avatarMaster: {
        position: 'relative',
        zIndex: 5,
    },
    avatarRing: {
        width: 130,
        height: 130,
        borderRadius: 65,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 6,
        ...theme.shadow,
    },
    avatarInner: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        fontSize: 56,
        fontWeight: '900',
        color: '#2076C7',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#3B82F6',
        borderWidth: 4,
        borderColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadow,
    },
    nameSection: {
        alignItems: 'center',
        marginTop: 18,
    },
    heroName: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFF',
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    idContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 8,
    },
    heroId: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '800',
        marginLeft: 6,
        letterSpacing: 0.5,
    },
    analyticsWrapper: {
        paddingHorizontal: 25,
        marginTop: -35,
        zIndex: 10,
    },
    analyticsBar: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 24,
        height: 85,
        alignItems: 'center',
        paddingHorizontal: 15,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 15,
            },
            android: {
                elevation: 10,
            },
        }),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1E293B',
    },
    statLabel: {
        fontSize: 10,
        color: '#94A3B8',
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 35,
        backgroundColor: '#F1F5F9',
    },
    contentBody: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 5,
        marginTop: 30,
        marginBottom: 12,
    },
    sectionHeaderLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 30,
        borderRadius: 8,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '900',
        color: '#64748B',
        letterSpacing: 1,
    },
    premiumCard: {
        backgroundColor: '#FFF',
        borderRadius: 28,
        padding: 5,
        ...theme.shadow,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    infoIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 18,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '800',
        letterSpacing: 0.5,
        marginBottom: 3,
    },
    infoValue: {
        fontSize: 16,
        color: '#1E293B',
        fontWeight: '700',
    },
    valueDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CBD5E1',
        marginLeft: 10,
    },
    settingAction: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    actionIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#F7FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 18,
    },
    actionLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
    },
    dangerZone: {
        marginTop: 35,
        marginBottom: 20,
    },
    logoutPremiumBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EF4444',
        padding: 18,
        borderRadius: 28,
        ...theme.shadow,
        shadowColor: '#EF4444',
        shadowOpacity: 0.4,
    },
    logoutIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    logoutTextMain: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '900',
    },
    logoutTextSub: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
    },
    powerIcon: {
        marginLeft: 'auto',
    },
    versionInfo: {
        marginTop: 20,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '900',
        letterSpacing: 1,
    },
    copyrightText: {
        fontSize: 10,
        color: '#CBD5E1',
        fontWeight: '600',
        marginTop: 5,
    },
    footerGhost: {
        height: 120,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    loadingText: {
        marginTop: 18,
        fontSize: 14,
        color: '#2076C7',
        fontWeight: '800',
        letterSpacing: 1,
    },
});

export default ProfileScreen;