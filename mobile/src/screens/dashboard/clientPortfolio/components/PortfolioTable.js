import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../../../constants/theme';

const PortfolioTable = ({ data, loading }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const ListHeader = () => (
        <View style={styles.headerRow}>
            <View style={[styles.headerCell, styles.idCol]}>
                <Text style={styles.headerLabel}>ID & STATUS</Text>
            </View>
            <View style={[styles.headerCell, styles.nameCol]}>
                <Text style={styles.headerLabel}>CLIENT INFO</Text>
            </View>
            <View style={[styles.headerCell, styles.contactCol]}>
                <Text style={styles.headerLabel}>CONTACT DETAILS</Text>
            </View>
            <View style={[styles.headerCell, styles.deptCol]}>
                <Text style={styles.headerLabel}>SERVICE TYPE</Text>
            </View>
            <View style={[styles.headerCell, styles.dateCol]}>
                <Text style={styles.headerLabel}>DATE</Text>
            </View>
            <View style={[styles.headerCell, styles.actionCol]}>
                <Text style={styles.headerLabel}>VIEW</Text>
            </View>
        </View>
    );

    const renderItem = ({ item, index }) => {
        const isReferral = item.source?.toLowerCase().includes('referral');

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.row, index % 2 === 1 && { backgroundColor: '#F9FAFB' }]}
            >
                {/* ID & Status */}
                <View style={[styles.cell, styles.idCol]}>
                    <LinearGradient
                        colors={['#1CADA3', '#2076C7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.idBadge}
                    >
                        <Text style={styles.idText}>{item.lead_id}</Text>
                    </LinearGradient>
                    <View style={[
                        styles.sourcePill,
                        isReferral ? styles.referralPill : styles.directPill
                    ]}>
                        <View style={[
                            styles.statusDot,
                            { backgroundColor: isReferral ? '#2563EB' : '#16A34A' }
                        ]} />
                        <Text style={[
                            styles.pillText,
                            isReferral ? styles.referralText : styles.directText
                        ]}>
                            {isReferral ? 'Referral' : 'Direct'}
                        </Text>
                    </View>
                </View>

                {/* Client Info */}
                <View style={[styles.cell, styles.nameCol]}>
                    <Text style={styles.nameText} numberOfLines={1}>
                        {(item.lead_name || 'N/A').toUpperCase()}
                    </Text>
                    <Text style={styles.deptText}>{item.department || '-'}</Text>
                </View>

                {/* Contacts */}
                <View style={[styles.cell, styles.contactCol]}>
                    <View style={styles.contactRow}>
                        <Ionicons name="call" size={12} color="#64748B" />
                        <Text style={styles.contactValue}>{item.contact_number}</Text>
                    </View>
                    <View style={styles.contactRow}>
                        <Ionicons name="mail" size={12} color="#64748B" />
                        <Text style={styles.contactValue} numberOfLines={1}>{item.email}</Text>
                    </View>
                </View>

                {/* Service */}
                <View style={[styles.cell, styles.deptCol]}>
                    <View style={styles.serviceTag}>
                        <Text style={styles.serviceTagText}>{item.sub_category || 'General'}</Text>
                    </View>
                </View>

                {/* Date */}
                <View style={[styles.cell, styles.dateCol]}>
                    <Text style={styles.dateValue}>{formatDate(item.created_at)}</Text>
                    <Text style={styles.timeValue}>10:45 AM</Text>
                </View>

                {/* Action */}
                <View style={[styles.cell, styles.actionCol]}>
                    <TouchableOpacity style={styles.actionIconBtn}>
                        <Ionicons name="chevron-forward-circle" size={24} color="#2076C7" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color="#2076C7" />
                <Text style={styles.loaderText}>Syncing Data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.tableBox}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.lead_id || Math.random().toString()}
                    ListHeaderComponent={ListHeader}
                    stickyHeaderIndices={[0]}
                    renderItem={renderItem}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={48} color="#E2E8F0" />
                            <Text style={styles.emptyPrimary}>No matching documents</Text>
                            <Text style={styles.emptySecondary}>Try adjusting your search criteria</Text>
                        </View>
                    )}
                    scrollEnabled={false}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    tableBox: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerCell: {
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    headerLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#4B5563',
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        alignItems: 'center',
    },
    cell: {
        paddingHorizontal: 16,
    },
    idBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginBottom: 6,
        alignSelf: 'flex-start',
    },
    idText: {
        fontSize: 11,
        fontWeight: '900',
        color: '#FFF',
    },
    sourcePill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        borderWidth: 1,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    pillText: {
        fontSize: 9,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    referralPill: {
        backgroundColor: '#EFF6FF',
        borderColor: '#DBEAFE',
    },
    referralText: {
        color: '#1D4ED8',
    },
    directPill: {
        backgroundColor: '#F0FDF4',
        borderColor: '#DCFCE7',
    },
    directText: {
        color: '#15803D',
    },
    nameText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 2,
    },
    deptText: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '600',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginVertical: 1,
    },
    contactValue: {
        fontSize: 12,
        color: '#374151',
        fontWeight: '500',
    },
    serviceTag: {
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    serviceTagText: {
        fontSize: 10,
        color: '#0369A1',
        fontWeight: '800',
    },
    dateValue: {
        fontSize: 12,
        fontWeight: '700',
        color: '#111827',
    },
    timeValue: {
        fontSize: 10,
        color: '#9CA3AF',
        marginTop: 2,
    },
    actionIconBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Column Widths
    idCol: { width: 120 },
    nameCol: { width: 180 },
    contactCol: { width: 220 },
    deptCol: { width: 150 },
    dateCol: { width: 120 },
    actionCol: { width: 70 },

    loaderContainer: {
        padding: 60,
        alignItems: 'center',
    },
    loaderText: {
        color: '#6B7280',
        fontSize: 13,
        fontWeight: '600',
        marginTop: 12,
    },
    emptyContainer: {
        padding: 80,
        alignItems: 'center',
        width: 860, // sum of columns
    },
    emptyPrimary: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '700',
        marginTop: 16,
    },
    emptySecondary: {
        color: '#9CA3AF',
        fontSize: 13,
        marginTop: 4,
    },
});

export default PortfolioTable;
