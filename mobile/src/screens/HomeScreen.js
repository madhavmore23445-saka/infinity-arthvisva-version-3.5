import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    SafeAreaView,
    Platform,
    Animated
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import theme from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [activeServiceTab, setActiveServiceTab] = useState('Finance');
    const scrollX = useRef(new Animated.Value(0)).current;

    const renderServiceTab = (tab) => (
        <TouchableOpacity
            key={tab}
            onPress={() => setActiveServiceTab(tab)}
            style={[
                styles.serviceTab,
                activeServiceTab === tab && styles.serviceTabActive
            ]}
        >
            <Text style={[
                styles.serviceTabText,
                activeServiceTab === tab && styles.serviceTabTextActive
            ]}>
                {tab}
            </Text>
        </TouchableOpacity>
    );

    const getServiceList = () => {
        switch (activeServiceTab) {
            case 'Finance': return services.finance;
            case 'Protection': return services.protection;
            case 'Investment': return services.investment;
            default: return [];
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* 🌅 GLASSY HEADER (Now inside ScrollView) */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                                style={styles.avatar}
                            />
                        </View>
                        <View>
                            <Text style={styles.greeting}>Welcome back,</Text>
                            <Text style={styles.userName}>{user?.name || 'Madhav More'}</Text>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Ionicons name="search-outline" size={20} color={theme.colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
                            <View style={styles.notifDot} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 🎠 HERO CAROUSEL WITH PAGINATION */}
                <View style={styles.heroSection}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        style={styles.carouselContainer}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: false }
                        )}
                        scrollEventThrottle={16}
                    >
                        {/* CARD 1: VISION */}
                        <LinearGradient
                            colors={['#1E40AF', '#3B82F6']} // Richer Blue
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.heroCard}
                        >
                            <View style={styles.heroContent}>
                                <View style={styles.heroBadge}>
                                    <Text style={styles.heroBadgeText}>INFINITY ARTHVISHVA</Text>
                                </View>
                                <Text style={styles.heroTitle}>Your Financial Success Is Our Priority</Text>
                                <Text style={styles.heroSubtitle}>Empowering 2700+ partners across India.</Text>
                                <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('Explore')}>
                                    <Text style={styles.heroBtnText}>Discover More</Text>
                                    <Ionicons name="arrow-forward" size={14} color="#1E40AF" />
                                </TouchableOpacity>
                            </View>
                            <Ionicons name="pie-chart" size={140} color="rgba(255,255,255,0.1)" style={styles.heroBgIcon} />
                        </LinearGradient>

                        {/* CARD 2: OFFER */}
                        <LinearGradient
                            colors={['#111827', '#1F2937']} // Premium Dark
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.heroCard}
                        >
                            <View style={styles.heroContent}>
                                <View style={[styles.heroBadge, { backgroundColor: '#FBBF24' }]}>
                                    <Text style={[styles.heroBadgeText, { color: '#000' }]}>LIMITED OFFER</Text>
                                </View>
                                <Text style={styles.heroTitle}>Home Loans starting @ 8.4%*</Text>
                                <Text style={styles.heroSubtitle}>Zero processing fees for first 50 applicants.</Text>
                                <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('AddDetailedLead')}>
                                    <Text style={styles.heroBtnText}>Apply Now</Text>
                                </TouchableOpacity>
                            </View>
                            <MaterialCommunityIcons name="home-analytics" size={140} color="rgba(255,255,255,0.1)" style={styles.heroBgIcon} />
                        </LinearGradient>
                    </ScrollView>

                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        <View style={[styles.dot, { opacity: 1, width: 20, backgroundColor: theme.colors.primary }]} />
                        <View style={[styles.dot, { opacity: 0.3 }]} />
                    </View>
                </View>

                {/* 💡 SMART INSIGHTS */}
                <View style={styles.insightsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                        {insights.map((item, index) => (
                            <View key={index} style={styles.insightPill}>
                                <View style={[styles.insightIconRing, { borderColor: item.color }]}>
                                    <item.lib name={item.icon} size={14} color={item.color} />
                                </View>
                                <Text style={styles.insightText}>{item.title}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* 🔥 QUICK ACTIONS GRID (Redesigned) */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                </View>
                <View style={styles.quickGrid}>
                    <QuickAction
                        icon="people" color="#FFF" bg="#3B82F6"
                        label="Leads" desc="Manage"
                        onPress={() => navigation.navigate('LeadManagement')}
                        isPrimary
                    />
                    <QuickAction
                        icon="briefcase" color="#10B981" bg="#D1FAE5"
                        label="Portfolio" desc="Track"
                        onPress={() => { }}
                    />
                    <QuickAction
                        icon="calculator" color="#8B5CF6" bg="#EDE9FE"
                        label="Tools" desc="Calc"
                        onPress={() => navigation.navigate('Explore')}
                    />
                    <QuickAction
                        icon="grid" color="#F59E0B" bg="#FEF3C7"
                        label="More" desc="Menu"
                        onPress={() => navigation.navigate('More')}
                    />
                </View>

                {/* 🏦 EXPLORE SERVICES */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Explore Services</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('AddDetailedLead')}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                {/* Service Tabs */}
                <View style={styles.serviceTabContainer}>
                    {['Finance', 'Protection', 'Investment'].map(renderServiceTab)}
                </View>

                {/* Service List (Premium Cards) */}
                <View style={styles.serviceList}>
                    {getServiceList().map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.serviceItem}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('AddDetailedLead')}
                        >
                            <View style={[styles.serviceIconContainer, { backgroundColor: item.bg }]}>
                                <item.lib name={item.icon} size={24} color={item.color} />
                            </View>
                            <View style={styles.serviceInfo}>
                                <Text style={styles.serviceTitle}>{item.title}</Text>
                                <Text style={styles.serviceSub}>{item.sub}</Text>
                            </View>
                            <View style={styles.actionBtn}>
                                <Ionicons name="add" size={20} color={theme.colors.primary} />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 🌟 WHY CHOOSE US (Clean Trust Bar) */}
                <View style={styles.trustBar}>
                    <View style={styles.trustItem}>
                        <Ionicons name="shield-checkmark" size={20} color="#059669" />
                        <Text style={styles.trustText}>Trusted by 2700+</Text>
                    </View>
                    <View style={styles.trustDivider} />
                    <View style={styles.trustItem}>
                        <Ionicons name="time" size={20} color="#2563EB" />
                        <Text style={styles.trustText}>48hr Approval</Text>
                    </View>
                    <View style={styles.trustDivider} />
                    <View style={styles.trustItem}>
                        <Ionicons name="headset" size={20} color="#D97706" />
                        <Text style={styles.trustText}>24/7 Support</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

// --- Components ---

const QuickAction = ({ icon, color, bg, label, desc, onPress, isPrimary }) => (
    <TouchableOpacity
        style={[styles.quickCard, isPrimary && styles.quickCardPrimary]}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <View style={[
            styles.quickIcon,
            { backgroundColor: bg },
            isPrimary && { backgroundColor: 'rgba(255,255,255,0.2)' }
        ]}>
            <Ionicons name={icon} size={22} color={color} />
        </View>
        <View>
            <Text style={[styles.quickLabel, isPrimary && { color: '#FFF' }]}>{label}</Text>
            <Text style={[styles.quickDesc, isPrimary && { color: 'rgba(255,255,255,0.8)' }]}>{desc}</Text>
        </View>
    </TouchableOpacity>
);

const insights = [
    { title: 'Market Updates', icon: 'trending-up', lib: Ionicons, color: '#10B981' },
    { title: 'Tax Saving Tips', icon: 'wallet', lib: Ionicons, color: '#3B82F6' },
    { title: 'SIP Calculator', icon: 'calculator', lib: Ionicons, color: '#8B5CF6' },
    { title: 'Gold Rates', icon: 'ellipse', lib: Ionicons, color: '#F59E0B' },
];

const services = {
    finance: [
        { title: 'Home Loan', sub: 'Rates from 8.4%', icon: 'home', lib: Ionicons, color: '#2563EB', bg: '#EFF6FF' },
        { title: 'Personal Loan', sub: 'Instant Approval', icon: 'person', lib: Ionicons, color: '#EC4899', bg: '#FDF2F8' },
        { title: 'Business Loan', sub: 'Collateral Free', icon: 'briefcase', lib: Ionicons, color: '#3B82F6', bg: '#EFF6FF' },
        { title: 'SME Loan', sub: 'Grow Business', icon: 'store', lib: FontAwesome5, color: '#F59E0B', bg: '#FFFBEB' },
    ],
    protection: [
        { title: 'Life Insurance', sub: 'Secure Future', icon: 'heart', lib: Ionicons, color: '#E11D48', bg: '#FFF1F2' },
        { title: 'Health Insurance', sub: 'Cashless Claims', icon: 'medical-bag', lib: MaterialCommunityIcons, color: '#10B981', bg: '#ECFDF5' },
        { title: 'Motor Insurance', sub: 'Own Damage', icon: 'car', lib: Ionicons, color: '#6366F1', bg: '#EEF2FF' },
        { title: 'Travel Insurance', sub: 'Global Cover', icon: 'airplane', lib: Ionicons, color: '#06B6D4', bg: '#ECFEFF' },
    ],
    investment: [
        { title: 'Mutual Funds', sub: 'High Returns', icon: 'trending-up', lib: Ionicons, color: '#22C55E', bg: '#F0FDF4' },
        { title: 'Fixed Deposits', sub: 'Guaranteed', icon: 'bank', lib: MaterialCommunityIcons, color: '#F59E0B', bg: '#FFFBEB' },
        { title: 'Real Estate', sub: 'Premium Land', icon: 'office-building', lib: MaterialCommunityIcons, color: '#64748B', bg: '#F8FAFC' },
    ]
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? 20 : 10,
        paddingBottom: 20,
        backgroundColor: '#F8FAFC', // Changed to match bg, making it seamless in scroll
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 2,
    },
    avatar: { width: 42, height: 42, borderRadius: 18 },
    greeting: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    userName: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    headerActions: { flexDirection: 'row', gap: 12 },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    notifDot: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.error,
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
    },

    heroSection: { marginBottom: 24 },
    carouselContainer: { paddingLeft: 24, paddingRight: 24 },
    heroCard: {
        width: width * 0.88,
        borderRadius: 28,
        padding: 24,
        height: 235,
        justifyContent: 'center',
        marginRight: 16,
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 8,
    },
    heroContent: { zIndex: 2 },
    heroBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        alignSelf: 'flex-start',
        marginBottom: 12,
        backdropFilter: 'blur(10px)',
    },
    heroBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    heroTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', lineHeight: 32, marginBottom: 8, maxWidth: '90%' },
    heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 20, maxWidth: '85%' },
    heroBtn: {
        backgroundColor: '#FFF',
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 100,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    heroBtnText: { fontSize: 12, fontWeight: '800', color: '#1E40AF' },
    heroBgIcon: { position: 'absolute', right: -30, bottom: -30, opacity: 0.15, transform: [{ rotate: '-10deg' }] },
    pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CBD5E1' },

    insightsContainer: { marginBottom: 32 },
    insightPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 100,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...theme.shadow
    },
    insightIconRing: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
    insightText: { fontSize: 13, fontWeight: '600', color: '#1E293B' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
    seeAll: { fontSize: 13, fontWeight: '700', color: theme.colors.brandBlue },

    quickGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    quickCard: {
        width: '48%',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },
    quickCardPrimary: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.3,
    },
    quickIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    quickLabel: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
    quickDesc: { fontSize: 12, color: '#94A3B8' },

    serviceTabContainer: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 20 },
    serviceTab: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 100,
        backgroundColor: '#F8FAFC',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    serviceTabActive: { backgroundColor: '#FFF', borderColor: '#E2E8F0', ...theme.shadow },
    serviceTabText: { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
    serviceTabTextActive: { color: theme.colors.primary },

    serviceList: { paddingHorizontal: 24, marginBottom: 32 },
    serviceItem: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
    },
    serviceIconContainer: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    serviceInfo: { flex: 1 },
    serviceTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
    serviceSub: { fontSize: 13, color: '#64748B' },
    actionBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },

    trustBar: { marginHorizontal: 24, backgroundColor: '#FFF', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 32 },
    trustItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    trustText: { fontSize: 12, fontWeight: '600', color: '#334155' },
    trustDivider: { width: 1, height: 20, backgroundColor: '#E2E8F0' },

});

export default HomeScreen;
