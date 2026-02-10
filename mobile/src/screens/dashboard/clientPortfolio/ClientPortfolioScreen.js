import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../../constants/theme';
import { DashboardService } from '../../../services/dashboardService';
import PortfolioFilters from './components/PortfolioFilters';
import PortfolioTable from './components/PortfolioTable';

const ClientPortfolioScreen = () => {
    const [activeTab, setActiveTab] = useState('clients'); // 'clients', 'applications', 'documents'
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedProduct, setSelectedProduct] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchClientDetails = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const response = await DashboardService.getAllClientDetails();
            if (response.success && Array.isArray(response.data)) {
                setLeads(response.data);
            } else {
                setLeads([]);
            }
        } catch (error) {
            console.error("Failed to fetch client details", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchClientDetails();
    }, [fetchClientDetails]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchClientDetails(false);
    };

    // Reset product when category changes
    useEffect(() => {
        setSelectedProduct('All');
    }, [selectedCategory]);

    const filteredLeads = leads.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.department === selectedCategory;
        const matchesProduct = selectedProduct === 'All' || item.sub_category === selectedProduct;

        const query = searchQuery.toLowerCase();
        const matchesSearch =
            (item.lead_name && item.lead_name.toLowerCase().includes(query)) ||
            (item.lead_id && item.lead_id.toLowerCase().includes(query)) ||
            (item.contact_number && item.contact_number.includes(query)) ||
            (item.email && item.email.toLowerCase().includes(query));

        return matchesCategory && matchesProduct && matchesSearch;
    });

    const activeClientsCount = leads.filter(l => l.source && !l.source.toLowerCase().includes('referral')).length;
    const referralLeadsCount = leads.filter(l => l.source && l.source.toLowerCase().includes('referral')).length;

    const tabs = [
        { id: 'clients', name: 'Clients', icon: 'people' },
        { id: 'applications', name: 'Apps', icon: 'document-attach' },
        { id: 'documents', name: 'Docs', icon: 'folder' }
    ];

    const renderTabContent = () => {
        if (activeTab === 'clients') {
            return (
                <View style={styles.tableContainer}>
                    <PortfolioTable data={filteredLeads} loading={loading} />
                </View>
            );
        }

        return (
            <View style={styles.emptyContent}>
                <Ionicons name="folder-open-outline" size={64} color="#E2E8F0" />
                <Text style={styles.emptyTitle}>No {activeTab} Records</Text>
                <Text style={styles.emptySubtitle}>We couldn't find any {activeTab} associated with your account yet.</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Premium Header */}
            <LinearGradient
                colors={['#1CADA3', '#2076C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.premiumHeader}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.headerTitle}>Client Portfolio</Text>
                            <Text style={styles.headerSubtitle}>Monitor and Manage your clients</Text>
                        </View>
                        <TouchableOpacity style={styles.headerIconBtn}>
                            <Ionicons name="notifications-outline" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Summary Cards */}
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Total Leads</Text>
                            <Text style={styles.summaryValue}>{leads.length}</Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Referrals</Text>
                            <Text style={styles.summaryValue}>{referralLeadsCount}</Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Active</Text>
                            <Text style={styles.summaryValue}>{activeClientsCount}</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.brandBlue} />
                }
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {/* Search Bar - Redesigned */}
                    <View style={styles.searchSection}>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search by name, ID or contact..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor={theme.colors.textSecondary}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Filters */}
                    <PortfolioFilters
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        selectedProduct={selectedProduct}
                        setSelectedProduct={setSelectedProduct}
                    />

                    {/* Navigation Tabs - Pill Redesign */}
                    <View style={styles.tabsWrapper}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
                            {tabs.map(tab => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <TouchableOpacity
                                        key={tab.id}
                                        onPress={() => setActiveTab(tab.id)}
                                        style={styles.tabContainer}
                                    >
                                        {isActive ? (
                                            <LinearGradient
                                                colors={['#1CADA3', '#2076C7']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.activeTabGradient}
                                            >
                                                <Ionicons name={tab.icon} size={18} color="#FFF" />
                                                <Text style={styles.activeTabText}>{tab.name}</Text>
                                                <View style={styles.badgeWrapper}>
                                                    <Text style={styles.badgeText}>
                                                        {tab.id === 'clients' ? filteredLeads.length : 0}
                                                    </Text>
                                                </View>
                                            </LinearGradient>
                                        ) : (
                                            <View style={styles.inactiveTabPill}>
                                                <Ionicons name={`${tab.icon}-outline`} size={18} color={theme.colors.textSecondary} />
                                                <Text style={styles.inactiveTabText}>{tab.name}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Tab Content */}
                    <View style={styles.mainContent}>
                        <Text style={styles.sectionTitle}>
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} List
                        </Text>
                        {renderTabContent()}
                    </View>
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
    premiumHeader: {
        paddingBottom: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    headerIconBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    summaryLabel: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 20,
        color: '#FFF',
        fontWeight: '800',
    },
    scrollView: {
        flex: 1,
        marginTop: -16, // Pull up to overlap with header curve
    },
    content: {
        paddingTop: 16,
    },
    searchSection: {
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 18,
        paddingHorizontal: 16,
        height: 56,
        ...theme.shadow,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        color: '#1E293B',
        fontWeight: '600',
    },
    tabsWrapper: {
        marginBottom: 24,
    },
    tabsContainer: {
        paddingHorizontal: 24,
        gap: 12,
    },
    tabContainer: {
        height: 44,
    },
    activeTabGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 22,
        gap: 8,
    },
    activeTabText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    badgeWrapper: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '800',
    },
    inactiveTabPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 22,
        backgroundColor: '#FFF',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        gap: 8,
    },
    inactiveTabText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    mainContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    tableContainer: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        ...theme.shadow,
    },
    emptyContent: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        backgroundColor: '#FFF',
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
        borderStyle: 'dashed',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#334155',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
        lineHeight: 20,
    },
});

export default ClientPortfolioScreen;

