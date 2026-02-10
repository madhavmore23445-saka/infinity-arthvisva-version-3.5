import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashboardService } from '../../../services/dashboardService';
import * as DocumentPicker from 'expo-document-picker';
import * as WebBrowser from 'expo-web-browser';
import theme from '../../../constants/theme';
import DocumentPreviewModal from './DocumentPreviewModal';

const MAX_FILE_SIZE_BYTES = 200 * 1024;

export default function LeadDocumentsModal({ visible, onClose, lead }) {
    const [loading, setLoading] = useState(true);
    const [documents, setDocuments] = useState({ uploaded: [], pending: [] });
    const [uploadingKey, setUploadingKey] = useState(null);

    // Preview Modal State
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewTitle, setPreviewTitle] = useState('');

    useEffect(() => {
        if (visible && lead) {
            fetchDocuments();
        }
    }, [visible, lead]);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            // Support both object structures if needed
            const leadId = lead.id || lead.original?.id;
            const response = await DashboardService.getLeadDocuments(leadId);
            if (response.success) {
                setDocuments({
                    uploaded: response.uploaded || [],
                    pending: response.pending || []
                });
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to fetch documents");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (doc) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true,
                multiple: false
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                if (file.size > MAX_FILE_SIZE_BYTES) {
                    Alert.alert("Error", "File exceeds 200KB limit.");
                    return;
                }

                setUploadingKey(doc.document_key);

                const formData = new FormData();
                const leadRefId = lead.detail_lead_id || lead.ref_id || lead.original?.detail_lead_id; // Robust ID check
                formData.append("leadDbId", leadRefId);
                formData.append("metadata", JSON.stringify([{ key: doc.document_key, label: doc.document_label }]));

                const fileObj = {
                    uri: file.uri,
                    name: file.name,
                    type: file.mimeType || 'application/octet-stream'
                };
                formData.append("documents", fileObj);

                await DashboardService.uploadLeadDocument(leadRefId, formData);

                Alert.alert("Success", "Document uploaded successfully");
                fetchDocuments();
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Upload failed");
        } finally {
            setUploadingKey(null);
        }
    };

    const openDocument = async (url, title = 'Document') => {
        if (!url) return;

        // Check for image or PDF extension
        // Note: URL might have query params etc, but usually ends with extension. 
        const isImage = /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(url);
        const isPdf = /\.pdf$/i.test(url);

        if (isImage || isPdf) {
            setPreviewUrl(url);
            setPreviewTitle(title);
            setIsPreviewVisible(true);
        } else {
            try {
                // For other file types, use WebBrowser (System Viewer)
                await WebBrowser.openBrowserAsync(url);
            } catch (err) {
                Alert.alert("Error", "Cannot open document");
            }
        }
    };

    const renderItem = ({ item, section }) => {
        const isPending = section === 'pending';
        return (
            <View style={[styles.docRow, isPending ? styles.pendingRow : styles.uploadedRow]}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.docLabel}>{item.document_label}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {isPending ? (
                        <>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.uploadBtn]}
                                onPress={() => handleUpload(item)}
                                disabled={uploadingKey === item.document_key}
                            >
                                {uploadingKey === item.document_key ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.actionBtnText}>UPLOAD</Text>
                                )}
                            </TouchableOpacity>
                            <View style={styles.requiredTag}>
                                <Text style={styles.requiredText}>REQUIRED</Text>
                            </View>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.viewBtn]}
                            onPress={() => openDocument(item.file_url, item.document_label)}
                        >
                            <Text style={styles.actionBtnText}>VIEW</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.overlayTouch} onPress={onClose} activeOpacity={1}>
                    <View style={[styles.modalContent, { height: '80%' }]} onStartShouldSetResponder={() => true}>
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.title}>Lead Documents</Text>
                                <Text style={styles.subtitle}>LEAD: {lead?.clientName || lead?.lead_name} | REF: {lead?.ref_id || lead?.original?.detail_lead_id}</Text>
                            </View>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <View style={styles.loader}>
                                <ActivityIndicator size="large" color={theme.colors.brandBlue} />
                            </View>
                        ) : (
                            <ScrollView contentContainerStyle={styles.listContent}>
                                {/* Uploaded Section */}
                                {documents.uploaded.length > 0 && (
                                    <View style={styles.section}>
                                        <Text style={[styles.sectionTitle, { color: theme.colors.success }]}>UPLOADED ({documents.uploaded.length})</Text>
                                        <View style={styles.uploadedContainer}>
                                            {documents.uploaded.map((doc, i) => <View key={i}>{renderItem({ item: doc, section: 'uploaded' })}</View>)}
                                        </View>
                                    </View>
                                )}

                                {/* Pending Section */}
                                {documents.pending.length > 0 && (
                                    <View style={styles.section}>
                                        <Text style={[styles.sectionTitle, { color: theme.colors.warning }]}>PENDING ({documents.pending.length})</Text>
                                        {documents.pending.map((doc, i) => <View key={i}>{renderItem({ item: doc, section: 'pending' })}</View>)}
                                    </View>
                                )}

                                {documents.uploaded.length === 0 && documents.pending.length === 0 && (
                                    <Text style={styles.emptyText}>No documents found.</Text>
                                )}
                            </ScrollView>
                        )}

                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                                <Text style={styles.closeBtnText}>CLOSE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Native Image Preview Modal */}
            <DocumentPreviewModal
                visible={isPreviewVisible}
                url={previewUrl}
                title={previewTitle}
                onClose={() => setIsPreviewVisible(false)}
            />
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    overlayTouch: { flex: 1, justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    title: { fontSize: 18, fontWeight: 'bold' },
    subtitle: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 },
    docRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1 },
    pendingRow: { backgroundColor: '#fff', borderColor: theme.colors.border },
    uploadedRow: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
    docLabel: { fontWeight: '600', fontSize: 14, color: theme.colors.text },
    actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6, minWidth: 80 },
    viewBtn: { backgroundColor: '#2563EB' },
    uploadBtn: { backgroundColor: '#2563EB' },
    actionBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },

    emptyText: { textAlign: 'center', color: theme.colors.textSecondary, marginTop: 20 },

    requiredTag: { backgroundColor: '#FFEDD5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100, marginLeft: 8 },
    requiredText: { color: '#C2410C', fontWeight: '800', fontSize: 10 },

    footer: { padding: 16, borderTopWidth: 1, borderTopColor: theme.colors.border, alignItems: 'flex-end' },
    closeBtn: { backgroundColor: theme.colors.surface, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6 },
    closeBtnText: { fontWeight: 'bold', color: theme.colors.text }
});
