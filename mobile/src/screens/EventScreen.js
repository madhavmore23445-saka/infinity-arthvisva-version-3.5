import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
    Dimensions,
    SafeAreaView,
    StatusBar,
    Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const EventScreen = () => {
    const [activeCategory, setActiveCategory] = useState('All');

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
            <View style={styles.header}>
                <Text style={styles.title}>Achievements & Insights</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* 🏆 AWARDS SECTION (NEW) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recognition</Text>
                    <LinearGradient
                        colors={['#FFFBEB', '#FFF7ED']}
                        style={styles.awardCard}
                    >
                        <View style={styles.awardContent}>
                            <View style={styles.awardBadge}>
                                <Ionicons name="trophy" size={14} color="#B45309" />
                                <Text style={styles.awardBadgeText}>WINNER</Text>
                            </View>
                            <Text style={styles.awardTitle}>ET Business Awards 2025</Text>
                            <Text style={styles.awardSubtitle}>Recognized for Excellence in Financial Advisory & Customer Trust in Pune.</Text>
                        </View>
                        <Image
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png' }}
                            style={styles.awardImg}
                        />
                    </LinearGradient>
                </View>

                {/* 🔍 SEARCH & CATEGORIES */}
                <View style={styles.filterSection}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search-outline" size={20} color="#94A3B8" />
                        <TextInput
                            placeholder="Search guides..."
                            placeholderTextColor="#94A3B8"
                            style={styles.searchInput}
                        />
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                        {categories.map((cat, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[styles.catBtn, activeCategory === cat && styles.catBtnActive]}
                                onPress={() => setActiveCategory(cat)}
                            >
                                <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* 📚 KNOWLEDGE HUB */}
                <View style={styles.feedSection}>
                    {articles.map((item, idx) => (
                        <TouchableOpacity key={idx} style={styles.articleCard}>
                            <View style={styles.articleImageContainer}>
                                <Image source={{ uri: item.image }} style={styles.articleImg} />
                                <View style={styles.categoryTag}>
                                    <Text style={styles.categoryTagText}>{item.category}</Text>
                                </View>
                            </View>
                            <View style={styles.articleContent}>
                                <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
                                <Text style={styles.articleDesc} numberOfLines={2}>{item.desc}</Text>

                                <View style={styles.articleFooter}>
                                    <View style={styles.authorRow}>
                                        <View style={styles.authorAvatar}>
                                            <Text style={styles.authorInitials}>{item.author.charAt(0)}</Text>
                                        </View>
                                        <Text style={styles.authorName}>{item.author}</Text>
                                    </View>
                                    <View style={styles.timeRow}>
                                        <Ionicons name="time-outline" size={14} color="#94A3B8" />
                                        <Text style={styles.timeText}>{item.time}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

// --- DATA ---
const categories = ['All', 'Loans', 'Wealth', 'Insurance', 'Tax', 'Market'];

const articles = [
    {
        title: '7 Secret Tips to Improve Your Credit Score in 2026',
        desc: 'Learn how to boost your creditworthiness and unlock better loan interest rates with these simple steps.',
        category: 'FINANCE',
        time: '5 min read',
        author: 'Sarah Johnson',
        image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
    },
    {
        title: 'Why Portfolio Diversification is More Important Than Ever',
        desc: 'Analyzing market trends for the upcoming quarter and how to protect your assets from volatility.',
        category: 'WEALTH',
        time: '8 min read',
        author: 'Michael Chen',
        image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
    },
    {
        title: 'Choosing a Life Insurance Policy: A Complete Guide',
        desc: 'Term vs Whole life? We break down everything you need to know to secure your familys future.',
        category: 'INSURANCE',
        time: '6 min read',
        author: 'David Wilson',
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
    }
];

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },

    header: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 20 : 10,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    title: { fontSize: 24, fontWeight: '800', color: '#1E293B', letterSpacing: -0.5 },

    section: { marginTop: 24, paddingHorizontal: 20 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },

    awardCard: {
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FEF3C7',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 2,
    },
    awardContent: { flex: 1 },
    awardBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 8, gap: 4 },
    awardBadgeText: { fontSize: 10, fontWeight: '800', color: '#B45309' },
    awardTitle: { fontSize: 18, fontWeight: '800', color: '#78350F', marginBottom: 4 },
    awardSubtitle: { fontSize: 13, color: '#92400E', lineHeight: 18 },
    awardImg: { width: 64, height: 64, marginLeft: 12 },

    filterSection: { marginTop: 24, paddingHorizontal: 20 },
    searchBar: {
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 48,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 16,
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#334155' },
    catScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
    catBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8 },
    catBtnActive: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
    catText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
    catTextActive: { color: '#FFF' },

    feedSection: { marginTop: 24, paddingHorizontal: 20, gap: 20 },
    articleCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 3,
    },
    articleImageContainer: { height: 180, width: '100%', position: 'relative' },
    articleImg: { width: '100%', height: '100%' },
    categoryTag: { position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backdropFilter: 'blur(10px)' },
    categoryTagText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
    articleContent: { padding: 16 },
    articleTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 8, lineHeight: 22 },
    articleDesc: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 16 },
    articleFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F8FAFC', paddingTop: 12 },
    authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    authorAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
    authorInitials: { fontSize: 10, fontWeight: '700', color: '#64748B' },
    authorName: { fontSize: 12, fontWeight: '600', color: '#475569' },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    timeText: { fontSize: 12, color: '#94A3B8' },
});

export default EventScreen;
