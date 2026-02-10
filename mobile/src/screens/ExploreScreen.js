import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
    StatusBar,
    Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ExploreScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* 🏢 HERO HEADER */}
                <View style={styles.header}>
                    <Text style={styles.headerEyebrow}>WHO WE ARE</Text>
                    <Text style={styles.headerTitle}>Infinity Arthvishva</Text>
                    <Text style={styles.headerDesc}>
                        Empowering 2700+ partners and families across India with advanced financial intelligence.
                    </Text>

                    <View style={styles.visionCard}>
                        <View style={styles.visionIconBox}>
                            <Ionicons name="eye-outline" size={24} color="#FFF" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.visionTitle}>Our Vision</Text>
                            <Text style={styles.visionText}>To seamlessly integrate advanced financial intelligence into everyday life for long-term prosperity.</Text>
                        </View>
                    </View>
                </View>

                {/* 🏭 GROUP OF COMPANIES */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Group of Companies</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.companyScroll}>
                        {companies.map((comp, idx) => (
                            <View key={idx} style={styles.companyCard}>
                                <View style={[styles.companyIcon, { backgroundColor: comp.color + '15' }]}>
                                    <MaterialCommunityIcons name={comp.icon} size={28} color={comp.color} />
                                </View>
                                <Text style={styles.companyName}>{comp.name}</Text>
                                <View style={styles.metaBox}>
                                    <Text style={styles.metaLabel}>CIN</Text>
                                    <Text style={styles.metaValue}>{comp.cin}</Text>
                                </View>
                                {comp.gst && (
                                    <View style={styles.metaBox}>
                                        <Text style={styles.metaLabel}>GST</Text>
                                        <Text style={styles.metaValue}>{comp.gst}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* 📍 BRANCH LOCATOR */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Our Presence</Text>
                        <Text style={styles.sectionSubtitle}>20+ Locations</Text>
                    </View>

                    <View style={styles.branchContainer}>
                        {branches.map((branch, idx) => (
                            <View key={idx} style={styles.branchCard}>
                                <View style={styles.branchHeader}>
                                    <View style={styles.branchIcon}>
                                        <Ionicons name="location" size={18} color="#2563EB" />
                                    </View>
                                    <Text style={styles.branchName}>{branch.city} Branch</Text>
                                </View>
                                <Text style={styles.branchAddress}>{branch.address}</Text>
                                <TouchableOpacity style={styles.directionBtn}>
                                    <Text style={styles.directionText}>Get Directions</Text>
                                    <Ionicons name="navigate-circle-outline" size={16} color="#2563EB" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const companies = [
    {
        name: 'Advisory Pvt Ltd',
        cin: 'U66190PN2025PTC238981',
        gst: '27AAICI0723K1ZJ',
        icon: 'briefcase-account',
        color: '#2563EB'
    },
    {
        name: 'Insurance Broker',
        cin: 'U65110PN2025PTC241213',
        gst: 'Under Process',
        icon: 'shield-check',
        color: '#0D9488'
    },
    {
        name: 'Mutual Fund LLP',
        cin: 'LLPIN: ACP-0126',
        gst: '27AALFI4941B1ZH',
        icon: 'finance',
        color: '#7C3AED'
    }
];

const branches = [
    { city: 'Pune (Main)', address: '1001 & 1201, 7 Business Square, Ganeshkhind Road, Shivajinagar, Pune 411016' },
    { city: 'Kanpur', address: 'Office 01, Kamlist Tower, Behind Mishra Jewellers, Nehru Nagar, Kanpur 209861' },
    { city: 'Nagpur', address: 'Apt 202, Sharda Enclave, Beside Platina Heart Institute, Sitabuldi, Nagpur 440012' },
    { city: 'Kolkata', address: 'PS Qube, Room 620, Plot IID/31/1, New Town, Kolkata 700135' },
    { city: 'Nashik', address: 'Office 2064, Roongta Shopping Hub, Mumbai-Agra Road, Nashik 422009' }
];

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },

    header: {
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingBottom: 32,
        borderBottomRightRadius: 32,
        borderBottomLeftRadius: 32,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
        zIndex: 10,
    },
    headerEyebrow: { fontSize: 11, fontWeight: '800', color: theme.colors.brandBlue, letterSpacing: 1.5, marginBottom: 8 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
    headerDesc: { fontSize: 15, color: '#64748B', lineHeight: 22, marginBottom: 24, maxWidth: '90%' },

    visionCard: {
        backgroundColor: '#1E293B',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    visionIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    visionTitle: { fontSize: 16, fontWeight: '700', color: '#FFF', marginBottom: 4 },
    visionText: { fontSize: 13, color: '#94A3B8', lineHeight: 18 },

    section: { marginTop: 32 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', paddingHorizontal: 20, marginBottom: 16 },
    sectionSubtitle: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    sectionHeader: { paddingHorizontal: 20, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },

    companyScroll: { paddingHorizontal: 20 },
    companyCard: {
        width: width * 0.7,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        ...theme.shadow,
    },
    companyIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    companyName: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
    metaBox: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 8 },
    metaLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
    metaValue: { fontSize: 12, color: '#334155', fontWeight: '600' },

    branchContainer: { paddingHorizontal: 20, gap: 16 },
    branchCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...theme.shadow
    },
    branchHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
    branchIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
    branchName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    branchAddress: { fontSize: 13, color: '#64748B', lineHeight: 20, marginLeft: 40, marginBottom: 12 },
    directionBtn: { flexDirection: 'row', alignItems: 'center', marginLeft: 40, gap: 6 },
    directionText: { fontSize: 13, fontWeight: '600', color: '#2563EB' },

});

export default ExploreScreen;
