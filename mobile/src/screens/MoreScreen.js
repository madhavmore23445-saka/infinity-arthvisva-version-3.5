import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    SafeAreaView,
    StatusBar,
    TextInput,
    Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import theme from '../constants/theme';
import GradientButton from '../components/common/GradientButton';

const MoreScreen = () => {
    const { user, logout } = useAuth();
    const [msgForm, setMsgForm] = useState({ name: '', phone: '', message: '' });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* 👤 PROFILE HEADER (PREMIUM) */}
                <View style={styles.profileCard}>
                    <View style={styles.profileRow}>
                        <Image
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                            style={styles.avatar}
                        />
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>{user?.name || 'Madhav More'}</Text>
                            <Text style={styles.userEmail}>{user?.email || 'madhav@infinity.com'}</Text>
                            <View style={styles.premiumBadge}>
                                <Ionicons name="star" size={10} color="#B45309" />
                                <Text style={styles.premiumText}>Premium Partner</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.editBtn}>
                            <Ionicons name="create-outline" size={20} color="#475569" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 🤝 PARTNER SECTION */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Partner Program</Text>
                    <TouchableOpacity style={styles.partnerCard}>
                        <View style={styles.partnerContent}>
                            <Text style={styles.partnerHead}>Become Our Partner</Text>
                            <Text style={styles.partnerSub}>Join 2700+ active partners. Unlock exclusive tools & rewards.</Text>
                            <Text style={styles.joinLink}>Join Now →</Text>
                        </View>
                        <Image
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1256/1256650.png' }}
                            style={styles.partnerImg}
                        />
                    </TouchableOpacity>
                </View>

                {/* 📞 CONTACT SUPPORT */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Get In Touch</Text>

                    {/* Contact Stats */}
                    <View style={styles.contactRow}>
                        <View style={styles.contactItem}>
                            <View style={[styles.contactIcon, { backgroundColor: '#EFF6FF' }]}>
                                <Ionicons name="call" size={20} color="#2563EB" />
                            </View>
                            <Text style={styles.contactLabel}>1800-532-7600</Text>
                        </View>
                        <View style={styles.contactItem}>
                            <View style={[styles.contactIcon, { backgroundColor: '#F0FDF4' }]}>
                                <Ionicons name="mail" size={20} color="#10B981" />
                            </View>
                            <Text style={styles.contactLabel}>info@infinity.com</Text>
                        </View>
                    </View>

                    {/* Quick Message Form */}
                    <View style={styles.messageCard}>
                        <Text style={styles.msgHead}>Send us a Message</Text>
                        <TextInput
                            placeholder="Your Name"
                            style={styles.input}
                            placeholderTextColor="#94A3B8"
                        />
                        <TextInput
                            placeholder="Phone Number"
                            style={styles.input}
                            placeholderTextColor="#94A3B8"
                            keyboardType="phone-pad"
                        />
                        <TextInput
                            placeholder="How can we help?"
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            placeholderTextColor="#94A3B8"
                            multiline
                        />
                        <GradientButton
                            title="Send Message"
                            style={{ borderRadius: 12, marginTop: 8 }}
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* ⚙️ SETTINGS LIST */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <View style={styles.settingsList}>
                        <SettingItem icon="lock-closed-outline" label="Change Password" color="#6366F1" />
                        <SettingItem icon="document-text-outline" label="Terms of Service" color="#64748B" />
                        <SettingItem icon="shield-checkmark-outline" label="Privacy Policy" color="#64748B" />
                    </View>
                </View>

                {/* 🚪 LOGOUT */}
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>

                {/* FOOTER */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Infinity Arthvishva v3.1</Text>
                    <Text style={styles.footerText}>CIN: U66190PN2025PTC238981</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const SettingItem = ({ icon, label, color }) => (
    <TouchableOpacity style={styles.settingItem}>
        <View style={[styles.settingIconBox, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },

    profileCard: {
        margin: 20,
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        ...theme.shadow,
        marginTop: Platform.OS === 'android' ? 40 : 20,
    },
    profileRow: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 16 },
    profileInfo: { flex: 1 },
    userName: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
    userEmail: { fontSize: 13, color: '#64748B', marginBottom: 8 },
    premiumBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100, alignSelf: 'flex-start', gap: 4 },
    premiumText: { fontSize: 10, fontWeight: '700', color: '#B45309' },
    editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },

    section: { marginBottom: 24, paddingHorizontal: 20 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },

    partnerCard: {
        backgroundColor: '#1E293B',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 10,
    },
    partnerContent: { flex: 1 },
    partnerHead: { fontSize: 18, fontWeight: '700', color: '#FFF', marginBottom: 6 },
    partnerSub: { fontSize: 12, color: '#94A3B8', lineHeight: 18, marginBottom: 12, maxWidth: '90%' },
    joinLink: { fontSize: 13, fontWeight: '700', color: theme.colors.brandBlue },
    partnerImg: { width: 80, height: 80, opacity: 0.9 },

    contactRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    contactItem: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', gap: 10 },
    contactIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    contactLabel: { fontSize: 12, fontWeight: '600', color: '#334155' },

    messageCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...theme.shadow,
    },
    msgHead: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#334155',
        marginBottom: 12,
    },

    settingsList: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 8,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...theme.shadow,
    },
    settingItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
    settingIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    settingLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#334155' },

    logoutBtn: { marginHorizontal: 20, paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#FEE2E2', backgroundColor: '#FFF' },
    logoutText: { color: theme.colors.error, fontWeight: '700', fontSize: 14 },

    footer: { alignItems: 'center', marginTop: 32, marginBottom: 20 },
    footerText: { fontSize: 11, color: '#94A3B8', marginBottom: 4 }
});

export default MoreScreen;
