import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    Modal,
    TouchableWithoutFeedback,
    Dimensions,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DashboardService } from '../../../services/dashboardService';
import ReferralLeadModal from './ReferralLeadModal';
import { useFocusEffect } from '@react-navigation/native';
import theme from '../../../constants/theme';
import LeadFormDataModal from './LeadFormDataModal';
import LeadDocumentsModal from './LeadDocumentsModal';
import GradientButton from '../../../components/common/GradientButton';

const { width } = Dimensions.get('window');

export default function LeadManagementScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState('referral');
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [pageSize, setPageSize] = useState(10);

    // UI State
    const [isAddMenuVisible, setIsAddMenuVisible] = useState(false);
    const [showPageSizePicker, setShowPageSizePicker] = useState(false);

    // Modals
    const [isReferralModalVisible, setIsReferralModalVisible] = useState(false);
    const [selectedLeadForDocs, setSelectedLeadForDocs] = useState(null);
    const [isDocsModalVisible, setIsDocsModalVisible] = useState(false);
    const [selectedLeadForForm, setSelectedLeadForForm] = useState(null);
    const [isFormModalVisible, setIsFormModalVisible] = useState(false);

    const pageSizeOptions = [5, 10, 15, 20, 50, 'All'];

    // Refs for outside click detection
    const addMenuRef = useRef(null);
    const pagePickerRef = useRef(null);
    const horizontalScrollRef = useRef(null);

    // Column Widths
    const COL_WIDTHS = {
        REID: 70,
        COL_REID: 58,
        ID: 83,
        NAME: 90,
        CONTACT: 100,
        EMAIL: 180,
        DEPT_PROD: 100,
        NOTES_DATE: 90,
        SELF_LOGIN: 69,
        ACTIONS: 100,
        EXTRA: 20,
    };

    const TABLE_WIDTH_REFERRAL = COL_WIDTHS.REID + COL_WIDTHS.NAME + COL_WIDTHS.CONTACT + COL_WIDTHS.DEPT_PROD + COL_WIDTHS.NOTES_DATE;
    const TABLE_WIDTH_DETAILED = COL_WIDTHS.ID + COL_WIDTHS.NAME + COL_WIDTHS.CONTACT + COL_WIDTHS.EXTRA + COL_WIDTHS.DEPT_PROD + COL_WIDTHS.SELF_LOGIN + COL_WIDTHS.ACTIONS + COL_WIDTHS.NOTES_DATE;


    const fetchLeads = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const response = activeTab === 'referral'
                ? await DashboardService.getLeads()
                : await DashboardService.getMyLeads();

            if (response.success && Array.isArray(response.data)) {
                if (activeTab === 'referral') {
                    setLeads(response.data);
                } else {
                    const mapped = response.data.map(item => ({
                        id: item.id,
                        ref_id: item.detail_lead_id,
                        lead_name: item.lead_name || item.form_data?.clientName || item.client?.name || "N/A",
                        contact_number: item.contact_number || item.form_data?.phone || item.client?.mobile || "N/A",
                        email: item.email || item.form_data?.email || "N/A",
                        sub_category: item.sub_category || "-",
                        department: item.department || "-",
                        is_self_login: item.meta?.is_self_login ? "Yes" : "No",
                        notes: item.notes || "-",
                        created_at: item.created_at,
                        original: item
                    }));
                    setLeads(mapped);
                }
            } else {
                setLeads([]);
            }
        } catch (error) {
            console.error("Failed to fetch leads", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab]);

    useFocusEffect(
        useCallback(() => {
            fetchLeads(true);
            return () => {
                setIsAddMenuVisible(false);
                setShowPageSizePicker(false);
            };
        }, [fetchLeads])
    );

    // Handle outside clicks
    useEffect(() => {
        const handleOutsideClick = () => {
            if (isAddMenuVisible) setIsAddMenuVisible(false);
            if (showPageSizePicker) setShowPageSizePicker(false);
        };

        return () => {
            // Cleanup
        };
    }, [isAddMenuVisible, showPageSizePicker]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLeads(false);
    };

    const toggleAddMenu = () => setIsAddMenuVisible(!isAddMenuVisible);

    const handleSelectAddOption = (option) => {
        setIsAddMenuVisible(false);
        if (option === 'referral') setIsReferralModalVisible(true);
        else navigation.navigate('AddDetailedLead');
    };

    const filteredLeads = leads.filter(lead => {
        const query = searchQuery.toLowerCase();
        return (
            (lead.lead_name && lead.lead_name.toLowerCase().includes(query)) ||
            (lead.ref_id && lead.ref_id.toString().toLowerCase().includes(query)) ||
            (lead.contact_number && lead.contact_number.includes(query)) ||
            (lead.email && lead.email.toLowerCase().includes(query))
        );
    });

    const paginatedLeads = pageSize === 'All' ? filteredLeads : filteredLeads.slice(0, pageSize);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: '2-digit'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // --- TABLE HEADERS ---
    const ReferralTableHeader = () => (
        <View style={[styles.tableHeader, { width: TABLE_WIDTH_REFERRAL }]}>
            <View style={[styles.headerCell, { width: COL_WIDTHS.REID }]}>
                <Text style={styles.headerCellText}>Lead ID</Text>
            </View>
            <View style={[styles.headerCell, { width: COL_WIDTHS.NAME }]}>
                <Text style={styles.headerCellText}>Client Name</Text>
            </View>
            <View style={[styles.headerCell, { width: COL_WIDTHS.CONTACT }]}>
                <Text style={styles.headerCellText}>Contact</Text>
            </View>
            <View style={[styles.headerCell, { width: COL_WIDTHS.DEPT_PROD }]}>
                <Text style={styles.headerCellText}>Dept / Product</Text>
            </View>
            <View style={[styles.headerCell, { width: COL_WIDTHS.NOTES_DATE }]}>
                <Text style={styles.headerCellText}>Notes / Date</Text>
            </View>
        </View>
    );

    const DetailedTableHeader = () => (
        <View style={[styles.tableHeader, { width: TABLE_WIDTH_DETAILED }]}>
            <View style={[styles.headerCell, { width: COL_WIDTHS.ID }]}>
                <Text style={styles.headerCellText}>Lead ID</Text>
            </View>
            <View style={[styles.headerCell, { width: COL_WIDTHS.NAME }]}>
                <Text style={styles.headerCellText}>Lead Name</Text>
            </View>
            <View style={[styles.headerCell, { width: COL_WIDTHS.CONTACT }]}>
                <Text style={styles.headerCellText}>Contact</Text>
            </View>
            {/* <View style={[styles.headerCell, { width: COL_WIDTHS.EMAIL }]}>
                <Text style={styles.headerCellText}>Email</Text>
            </View> */}
            <View style={[styles.headerCell, { width: COL_WIDTHS.DEPT_PROD }]}>
                <Text style={styles.headerCellText}>Dept / Product</Text>
            </View>
            <View style={[styles.headerCell, { width: COL_WIDTHS.SELF_LOGIN }]}>
                <Text style={styles.headerCellText}>Self Login</Text>
            </View>
            <View style={[styles.headerCell, { width: COL_WIDTHS.ACTIONS, alignItems: 'center' }]}>
                <Text style={styles.headerCellText}>Actions</Text>
            </View>
            <View style={[styles.headerCell, { width: COL_WIDTHS.NOTES_DATE }]}>
                <Text style={styles.headerCellText}>Notes / Date</Text>
            </View>
        </View>
    );

    // --- REFERRAL LEADS ROW ---
    // --- REFERRAL LEADS ROW ---
    const ReferralLeadRow = ({ item, index }) => (
        <View style={[styles.tableRow, index % 2 === 1 && styles.tableRowEven, { width: TABLE_WIDTH_REFERRAL }]}>
            <View style={[styles.cell, { width: COL_WIDTHS.COL_REID }]}>
                <Text style={styles.cellText}>{item.ref_id || 'N/A'}</Text>
            </View>
            <View style={[styles.cell, { width: COL_WIDTHS.NAME }]}>
                <Text style={[styles.cellText, styles.textPrimary]}>{item.lead_name}</Text>
            </View>
            <View style={[styles.cell, { width: COL_WIDTHS.CONTACT }]}>
                <Text style={styles.cellText}>{item.contact_number}</Text>
            </View>
            <View style={[styles.cell, { width: COL_WIDTHS.DEPT_PROD }]}>
                <View style={[styles.stackedContainer]}>
                    <View style={[styles.tableBadge, styles.badgeDept]}>
                        <Text style={styles.tableBadgeText} numberOfLines={1}>{item.department || '-'}</Text>
                    </View>
                    <View style={[styles.tableBadge, styles.badgeProd]}>
                        <Text style={styles.tableBadgeText} numberOfLines={1}>{item.sub_category || '-'}</Text>
                    </View>
                </View>
            </View>
            <View style={[styles.cell, { width: COL_WIDTHS.NOTES_DATE }]}>
                <View style={styles.stackedContainer}>
                    <Text style={[styles.cellText, styles.notesText]} numberOfLines={1}>{item.notes || '-'}</Text>
                    <Text style={styles.dateTextSmall}>{formatDate(item.created_at)}</Text>
                </View>
            </View>
        </View>
    );

    // --- DETAILED LEADS ROW ---
    const DetailedLeadRow = ({ item, index }) => (
        <View style={[styles.tableRow, index % 2 === 1 && styles.tableRowEven, { width: TABLE_WIDTH_DETAILED }]}>
            <View style={[styles.cell, { width: COL_WIDTHS.ID }]}>
                <Text style={styles.cellText}>{item.ref_id || 'N/A'}</Text>
            </View>
            <View style={[styles.cell, { width: COL_WIDTHS.NAME }]}>
                <Text style={[styles.cellText, styles.textPrimary]}>{item.lead_name}</Text>
            </View>

            {/* <View style={[styles.cell, { width: COL_WIDTHS.CONTACT }]}>
                <Text style={styles.cellText}>{item.contact_number}</Text>
            </View>
            <View style={[styles.cell, { width: COL_WIDTHS.EMAIL }]}>
                <Text style={styles.cellText} numberOfLines={1}>{item.email}</Text>
            </View> */}


            <View style={[styles.cell, { width: COL_WIDTHS.CONTACT }]}>
                <View style={[styles.stackedContainer]}>
                    <View style={[styles.tableBadge, styles.badgeDept]}>
                        <Text style={styles.tableBadgeText} numberOfLines={1}>{item.contact_number || '-'}</Text>
                    </View>
                    <View style={[styles.tableBadge, styles.badgeProd]}>
                        <Text style={styles.tableBadgeText} numberOfLines={1}>{item.email || '-'}</Text>
                    </View>
                </View>


            </View>


            {/* 
            <View style={[styles.cell, { width: COL_WIDTHS.CONTACT }]}>
                <Text style={styles.cellText}>{item.contact_number}</Text>
            </View>
            <View style={[styles.cell, { width: COL_WIDTHS.EMAIL }]}>
                <Text style={styles.cellText} numberOfLines={1}>{item.email}</Text>
            </View> */}


            <View style={[styles.cell, { width: COL_WIDTHS.DEPT_PROD }]}>
                <View style={[styles.stackedContainer]}>
                    <View style={[styles.tableBadge, styles.badgeDept]}>
                        <Text style={styles.tableBadgeText} numberOfLines={1}>{item.department || '-'}</Text>
                    </View>
                    <View style={[styles.tableBadge, styles.badgeProd]}>
                        <Text style={styles.tableBadgeText} numberOfLines={1}>{item.sub_category || '-'}</Text>
                    </View>
                </View>
            </View>






            <View style={[styles.cell, { width: COL_WIDTHS.SELF_LOGIN, alignItems: 'center' }]}>
                <View style={[
                    styles.statusBadge,
                    item.is_self_login === 'Yes' ? styles.statusSuccess : styles.statusWarning
                ]}>
                    <Text style={styles.statusText}>{item.is_self_login}</Text>
                </View>
            </View>




            <View style={[styles.cell, { width: COL_WIDTHS.ACTIONS }]}>
                <View style={styles.tableActionGroup}>
                    <TouchableOpacity
                        style={[styles.tableVerticalAction, styles.actionBgView]}
                        onPress={() => { setSelectedLeadForForm(item); setIsFormModalVisible(true); }}
                    >
                        <Ionicons name="eye" size={16} color={theme.colors.primary} />
                        <Text style={styles.actionTextSmall}>Form</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tableVerticalAction, styles.actionBgDocs]}
                        onPress={() => { setSelectedLeadForDocs(item); setIsDocsModalVisible(true); }}
                    >
                        <Ionicons name="document-text" size={16} color="#8B5CF6" />
                        <Text style={styles.actionTextSmall}>Docs</Text>
                    </TouchableOpacity>
                </View>
            </View>





            <View style={[styles.cell, { width: COL_WIDTHS.NOTES_DATE }]}>
                <View style={styles.stackedContainer}>
                    <Text style={[styles.cellText, styles.notesText]} numberOfLines={1}>{item.notes || '-'}</Text>
                    <Text style={styles.dateTextSmall}>{formatDate(item.created_at)}</Text>
                </View>
            </View>
        </View>
    );


    // Render item based on active tab
    const renderItem = ({ item, index }) => {
        if (activeTab === 'referral') {
            return <ReferralLeadRow item={item} index={index} />;
        } else {
            return <DetailedLeadRow item={item} index={index} />;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

            {/* Header Section */}
            {/* <View style={styles.header}>
                <Text style={styles.headerTitle}>Lead Management</Text>
                <Text style={styles.headerSubtitle}>
                    {activeTab === 'referral' ? 'Referral Leads' : 'Detailed Leads'}
                </Text>
            </View> */}

            {loading && !refreshing ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading leads...</Text>
                </View>
            ) : (
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[theme.colors.primary]}
                            tintColor={theme.colors.primary}
                        />
                    }
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* TOP CONTROLS */}
                    <View style={styles.controlsRow}>
                        <View style={styles.searchBox}>
                            <Ionicons name="search" size={16} color={theme.colors.textSecondary} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search by name, ID, contact..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor={theme.colors.textSecondary}
                            />
                        </View>

                        <View style={styles.controlsRight}>
                            <TouchableOpacity
                                style={styles.pageSizeBtn}
                                onPress={() => setShowPageSizePicker(!showPageSizePicker)}
                            >
                                <Text style={styles.pageSizeText}>{pageSize === 'All' ? 'All' : `${pageSize} rows`}</Text>
                                <Ionicons name="chevron-down" size={14} color={theme.colors.text} />
                            </TouchableOpacity>

                            <View style={{ width: 90 }}>
                                <GradientButton
                                    onPress={toggleAddMenu}
                                    title="Lead"
                                    icon={<Ionicons name="add" size={18} color="#FFF" />}
                                    style={{ height: 42, borderRadius: 12 }}
                                    textStyle={{ fontSize: 12 }}
                                />
                            </View>
                        </View>
                    </View>

                    {/* TABS */}
                    <View style={styles.tabRow}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'referral' && styles.tabActive]}
                            onPress={() => setActiveTab('referral')}
                        >
                            <Ionicons
                                name="people"
                                size={18}
                                color={activeTab === 'referral' ? '#FFF' : theme.colors.textSecondary}
                            />
                            <Text style={[styles.tabLabel, activeTab === 'referral' && styles.tabLabelActive]}>
                                Referral
                            </Text>
                            <View style={[styles.badge, activeTab === 'referral' && styles.badgeActive]}>
                                <Text style={[styles.badgeText, activeTab === 'referral' && styles.badgeTextActive]}>
                                    {leads.length}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'detailed' && styles.tabActive]}
                            onPress={() => setActiveTab('detailed')}
                        >
                            <Ionicons
                                name="document-text"
                                size={18}
                                color={activeTab === 'detailed' ? '#FFF' : theme.colors.textSecondary}
                            />
                            <Text style={[styles.tabLabel, activeTab === 'detailed' && styles.tabLabelActive]}>
                                Detailed
                            </Text>
                            <View style={[styles.badge, activeTab === 'detailed' && styles.badgeActive]}>
                                <Text style={[styles.badgeText, activeTab === 'detailed' && styles.badgeTextActive]}>
                                    {leads.length}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* RESULTS COUNT */}
                    <View style={styles.resultsRow}>
                        <Text style={styles.resultsText}>
                            {filteredLeads.length} {filteredLeads.length === 1 ? 'result' : 'results'}
                            {searchQuery ? ` for "${searchQuery}"` : ''}
                        </Text>
                        {pageSize !== 'All' && filteredLeads.length > pageSize && (
                            <Text style={styles.showingText}>
                                Showing {Math.min(pageSize, filteredLeads.length)} of {filteredLeads.length}
                            </Text>
                        )}
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={true}
                        style={styles.tableContainer}
                    >
                        <View>
                            {activeTab === 'referral' ? <ReferralTableHeader /> : <DetailedTableHeader />}
                            <FlatList
                                data={paginatedLeads}
                                keyExtractor={item => `${item.id}-${activeTab}`}
                                renderItem={renderItem}
                                contentContainerStyle={styles.listContainer}
                                scrollEnabled={false}
                                ListEmptyComponent={
                                    <View style={[styles.empty, { width: activeTab === 'referral' ? TABLE_WIDTH_REFERRAL : TABLE_WIDTH_DETAILED }]}>
                                        <Ionicons name="file-tray-outline" size={64} color="#E2E8F0" />
                                        <Text style={styles.emptyTitle}>No leads found</Text>
                                        <Text style={styles.emptySubtitle}>
                                            {searchQuery
                                                ? 'Try adjusting your search terms'
                                                : activeTab === 'referral'
                                                    ? 'Add your first referral lead'
                                                    : 'Add your first detailed lead'
                                            }
                                        </Text>
                                    </View>
                                }
                            />
                        </View>
                    </ScrollView>
                </ScrollView>
            )}

            {/* Page Size Picker Modal */}
            <Modal
                visible={showPageSizePicker}
                transparent={true}
                animationType="none"
                onRequestClose={() => setShowPageSizePicker(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowPageSizePicker(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.pickerWindow}>
                                <Text style={styles.pickerTitle}>Rows per page</Text>
                                {pageSizeOptions.map(opt => (
                                    <TouchableOpacity
                                        key={opt}
                                        style={[styles.pickerOption, pageSize === opt && styles.pickerOptionActive]}
                                        onPress={() => { setPageSize(opt); setShowPageSizePicker(false); }}
                                    >
                                        <Text style={[styles.pickerLabel, pageSize === opt && styles.pickerLabelActive]}>
                                            {opt === 'All' ? 'Show All' : `${opt} rows`}
                                        </Text>
                                        {pageSize === opt && (
                                            <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Add Menu Modal */}
            <Modal
                visible={isAddMenuVisible}
                transparent={true}
                animationType="none"
                onRequestClose={() => setIsAddMenuVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsAddMenuVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.addMenuWindow}>
                                <Text style={styles.addMenuTitle}>Add New Lead</Text>
                                <TouchableOpacity
                                    style={styles.addMenuItem}
                                    onPress={() => handleSelectAddOption('referral')}
                                >
                                    <View style={[styles.addMenuIcon, { backgroundColor: '#E0F2FE' }]}>
                                        <Ionicons name="person-add" size={20} color={theme.colors.primary} />
                                    </View>
                                    <View style={styles.addMenuContent}>
                                        <Text style={styles.addMenuText}>Referral Lead</Text>
                                        <Text style={styles.addMenuSubtext}>Quick referral entry</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.addMenuItem}
                                    onPress={() => handleSelectAddOption('detailed')}
                                >
                                    <View style={[styles.addMenuIcon, { backgroundColor: '#DCFCE7' }]}>
                                        <Ionicons name="list" size={20} color={theme.colors.success} />
                                    </View>
                                    <View style={styles.addMenuContent}>
                                        <Text style={styles.addMenuText}>Detailed Lead</Text>
                                        <Text style={styles.addMenuSubtext}>Full client information</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* MODALS */}
            <ReferralLeadModal
                visible={isReferralModalVisible}
                onClose={() => setIsReferralModalVisible(false)}
                onSuccess={() => fetchLeads(false)}
            />
            <LeadDocumentsModal
                visible={isDocsModalVisible}
                onClose={() => setIsDocsModalVisible(false)}
                lead={selectedLeadForDocs}
            />
            <LeadFormDataModal
                visible={isFormModalVisible}
                onClose={() => setIsFormModalVisible(false)}
                lead={selectedLeadForForm}
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
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1E293B',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
    },
    controlsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 16,
        alignItems: 'center',
        gap: 12,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        height: 42,
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        ...theme.shadow,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 12,
        color: '#1E293B',
        fontWeight: '500',
    },
    controlsRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    addBtn: {
        flexDirection: 'row',        // aligns text + icon horizontally
        alignItems: 'center',        // vertical alignment
        justifyContent: 'center',
        backgroundColor: '#2563EB',  // example primary color
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },

    addBtnText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
        marginRight: 6,              // space before +
    },

    pageSizeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        height: 42,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        gap: 8,
        minWidth: 100,
        justifyContent: 'center',
    },
    pageSizeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    addBtn: {
        width: 48,
        height: 42,
        backgroundColor: theme.colors.primary,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadow,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerWindow: {
        width: width * 0.8,
        maxWidth: 300,
        backgroundColor: '#FFF',
        borderRadius: 20,
        paddingVertical: 8,
        ...theme.shadow,
    },
    pickerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    pickerOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    pickerOptionActive: {
        backgroundColor: '#F8FAFC',
    },
    pickerLabel: {
        fontSize: 15,
        color: '#334155',
        fontWeight: '500',
    },
    pickerLabelActive: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    addMenuWindow: {
        width: width * 0.9,
        maxWidth: 400,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        ...theme.shadow,
    },
    addMenuTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 16,
    },
    addMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        marginBottom: 8,
    },
    addMenuIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    addMenuContent: {
        flex: 1,
    },
    addMenuText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 2,
    },
    addMenuSubtext: {
        fontSize: 13,
        color: '#64748B',
    },
    tabRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: 12,
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#F1F5F9',
        gap: 8,
        paddingHorizontal: 16,
    },
    tabActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    tabLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748B',
    },
    tabLabelActive: {
        color: '#FFF',
    },
    badge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        minWidth: 32,
        alignItems: 'center',
    },
    badgeActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
    },
    badgeTextActive: {
        color: '#FFF',
    },
    resultsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    resultsText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    showingText: {
        fontSize: 13,
        color: '#94A3B8',
    },
    listContainer: {
        paddingBottom: 40,
    },
    tableContainer: {
        flex: 1,
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        height: 50,
        alignItems: 'center',
    },
    headerCell: {
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    headerCellText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        minHeight: 84,
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    tableRowEven: {
        backgroundColor: '#F8FAFC',
    },
    cell: {
        paddingHorizontal: 12,
        justifyContent: 'center',
    },
    cellText: {
        fontSize: 13,
        color: '#334155',
        fontWeight: '500',
        lineHeight: 18,
    },
    textPrimary: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    stackedContainer: {
        gap: 6,
    },
    tableBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    badgeDept: {
        backgroundColor: '#E0F2FE',
    },
    badgeProd: {
        backgroundColor: '#F0F9FF',
    },
    tableBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#0369A1',
    },
    notesText: {
        color: '#64748B',
        fontSize: 12,
        fontStyle: 'italic',
    },
    dateTextSmall: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'center',
    },
    statusSuccess: {
        backgroundColor: '#DCFCE7',
    },
    statusWarning: {
        backgroundColor: '#FEF3C7',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#166534',
    },
    tableActionGroup: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tableVerticalAction: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        borderRadius: 8,
        minWidth: 44,
    },
    actionBgView: {
        backgroundColor: '#EEF2FF',
    },
    actionBgDocs: {
        backgroundColor: '#F5F3FF',
    },
    actionTextSmall: {
        fontSize: 10,
        fontWeight: '700',
        color: '#475569',
        marginTop: 4,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
    },
    empty: {
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#475569',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 22,
    },
});