import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Alert,
    Dimensions,
    Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { productCards } from '../data/productData';
import theme from '../../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const CARD_GAP = 12;
const CARD_WIDTH = (width - (theme.spacing.md * 2) - CARD_GAP) / COLUMN_COUNT;

export default function AddDetailedLeadScreen() {
    const [activeTab, setActiveTab] = useState('loans');
    const navigation = useNavigation();

    const tabs = [
        { id: 'loans', name: 'Loans', icon: 'wallet-outline' },
        { id: 'insurance', name: 'Insurance', icon: 'shield-checkmark-outline' },
        { id: 'mutual_funds', name: 'Mutual Fund', icon: 'trending-up-outline' },
        { id: 'investment', name: 'Investments', icon: 'bar-chart-outline' },
        { id: 'real_estate', name: 'Real Estate', icon: 'business-outline' },
        { id: 'unlisted', name: 'Unlisted', icon: 'lock-closed-outline' },
    ];

    const getIconForProduct = (title) => {
        const titleLower = title.toLowerCase();
        if (titleLower.includes('home')) return { lib: Ionicons, name: 'home-outline', color: '#6366F1' }; // Indigo
        if (titleLower.includes('personal')) return { lib: Ionicons, name: 'person-outline', color: '#EC4899' }; // Pink
        if (titleLower.includes('business')) return { lib: Ionicons, name: 'briefcase-outline', color: '#3B82F6' }; // Blue
        if (titleLower.includes('mortgage')) return { lib: MaterialCommunityIcons, name: 'bank-transfer', color: '#10B981' }; // Emerald
        if (titleLower.includes('sme')) return { lib: FontAwesome5, name: 'store', color: '#F59E0B' }; // Amber
        if (titleLower.includes('education')) return { lib: Ionicons, name: 'school-outline', color: '#8B5CF6' }; // Violet
        if (titleLower.includes('vehicle')) return { lib: Ionicons, name: 'car-sport-outline', color: '#EF4444' }; // Red
        if (titleLower.includes('cattle')) return { lib: MaterialCommunityIcons, name: 'cow', color: '#78350F' }; // Brown
        if (titleLower.includes('travel')) return { lib: Ionicons, name: 'airplane-outline', color: '#06B6D4' }; // Cyan
        if (titleLower.includes('life')) return { lib: Ionicons, name: 'heart-outline', color: '#E11D48' }; // Rose
        if (titleLower.includes('health')) return { lib: MaterialCommunityIcons, name: 'hospital-box-outline', color: '#14B8A6' }; // Teal
        if (titleLower.includes('fire')) return { lib: MaterialCommunityIcons, name: 'fire', color: '#F97316' }; // Orange
        if (titleLower.includes('marine')) return { lib: Ionicons, name: 'boat-outline', color: '#3B82F6' }; // Blue
        if (titleLower.includes('wealth')) return { lib: MaterialCommunityIcons, name: 'gold', color: '#EAB308' }; // Yellow
        if (titleLower.includes('bond')) return { lib: MaterialCommunityIcons, name: 'file-certificate-outline', color: '#64748B' }; // Slate

        return { lib: Ionicons, name: 'ellipse-outline', color: theme.colors.textSecondary };
    };

    const handleNavigation = (title) => {
        const routes = {
            // "Home Loans": "HomeLoanForm",
            // "Personal Loans": "PersonalLoanForm",
            // "Loan Against Securities / MF": "LoanAgainstSecuritiesForm",

            "Home Loans": "HomeLoanForm",
            "Personal Loans": "PersonalLoanForm",
            "Business Loan": "BusinessLoanForm",
            "Education Loan": "EducationLoanForm",
            "Mortgage Loans": "MortgageLoanForm",
            "SME": "SMELoanForm",
            "NRP Loan": "NRPLoanForm",
            "Vehicle Loan": "VehicleLoanForm",
            "Loan Against Securities / MF": "LoanAgainstSecuritiesForm",

            // insurance forms 


            // "Cattle Insurance": "CattleInsuranceForm",
            // "Travel Insurance": "TravelInsuranceForm",
            // "Life Insurance": "LifeInsuranceForm",
            // "Health Insurance": "HealthInsuranceForm"
          
            "Cattle Insurance": "CattleInsuranceForm",
            "Travel Insurance": "TravelInsuranceForm",
            "Life Insurance": "LifeInsuranceForm",
            "Health Insurance": "HealthInsuranceForm",  


            "Corporate Insurance": "CorporateInsuranceForm",
            "Loan Protector": "LoanProtectorForm",
            // "Fire Insurance": "FireInsuranceForm",
            // "Marine Insurance": "MarineInsuranceForm"

            // investment

             "Wealth Management": "WealthManagementForm",
             "Bonds": "BondsForm",
            //  "Fixed Deposit": "FixedDepositForm"





        };
        const route = routes[title];
        if (route) {
            navigation.navigate(route);
        } else {
            Alert.alert("Coming Soon", "This form is under development.");
        }
    };

    const renderProductCard = ({ item }) => {
        const { lib: IconLib, name, color } = getIconForProduct(item.title);

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleNavigation(item.title)}
                style={styles.card}
            >
                <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                    <IconLib name={name} size={28} color={color} />
                </View>

                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>

                <View style={styles.actionRow}>
                    <Text style={styles.actionText}>Add Lead</Text>
                    <Ionicons name="arrow-forward-circle" size={20} color={theme.colors.textSecondary} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('LeadManagement')}
                >
                    <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add New Lead</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabScroll}
                    decelerationRate="fast"
                >
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <TouchableOpacity
                                key={tab.id}
                                style={[styles.tab, isActive && styles.activeTab]}
                                onPress={() => setActiveTab(tab.id)}
                            >
                                <Ionicons
                                    name={tab.icon}
                                    size={16}
                                    color={isActive ? '#fff' : theme.colors.textSecondary}
                                    style={{ marginRight: 6 }}
                                />
                                <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                                    {tab.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Content Grid */}
            <FlatList
                data={productCards[activeTab] || []}
                keyExtractor={(item, index) => item.title + index}
                renderItem={renderProductCard}
                numColumns={COLUMN_COUNT}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <Text style={styles.sectionTitle}>
                        {tabs.find(t => t.id === activeTab)?.name} Products
                    </Text>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingTop: Platform.OS === 'android' ? 40 : 12,
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    tabContainer: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        zIndex: 10,
    },
    tabScroll: {
        paddingHorizontal: theme.spacing.md,
        paddingRight: theme.spacing.md,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        marginRight: 10,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeTab: {
        backgroundColor: theme.colors.brandBlue,
        borderColor: theme.colors.brandBlue,
        shadowColor: theme.colors.brandBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    activeTabText: {
        color: '#fff',
    },
    listContent: {
        padding: theme.spacing.md,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
        marginLeft: 4,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: CARD_GAP,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
        elevation: 2,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        height: 150,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        lineHeight: 20,
        marginBottom: 'auto',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F8FAFC',
        paddingTop: 8,
    },
    actionText: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
});
