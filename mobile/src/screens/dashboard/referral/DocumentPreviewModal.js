import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
    Dimensions,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import theme from '../../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function DocumentPreviewModal({ visible, onClose, url, title }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    if (!visible || !url) return null;

    // Detect if content is PDF
    const isPdf = url.toLowerCase().includes('.pdf');

    // For Android, we use Google Docs Viewer for PDFs as WebView PDF support is limited
    const getSource = () => {
        if (isPdf && Platform.OS === 'android') {
            return { uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}` };
        }
        return { uri: url };
    };

    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View style={styles.container}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title} numberOfLines={1}>{title || 'Document Preview'}</Text>

                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Text style={styles.closeText}>Close</Text>
                            <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Content Viewer */}
                    <View style={styles.contentContainer}>
                        {loading && !error && (
                            <View style={styles.loaderContainer}>
                                <ActivityIndicator size="large" color={theme.colors.brandBlue} />
                            </View>
                        )}

                        {error && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
                                <Text style={styles.errorText}>Failed to load document</Text>
                            </View>
                        )}

                        {isPdf ? (
                            <WebView
                                source={getSource()}
                                style={styles.webview}
                                onLoadEnd={() => setLoading(false)}
                                onError={() => {
                                    setLoading(false);
                                    setError(true);
                                }}
                                originWhitelist={['*']}
                            />
                        ) : (
                            <Image
                                source={{ uri: url }}
                                style={styles.image}
                                resizeMode="contain"
                                onLoadEnd={() => setLoading(false)}
                                onError={() => {
                                    setLoading(false);
                                    setError(true);
                                }}
                            />
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        width: '100%',
        height: '85%',
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        overflow: 'hidden'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0'
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        flex: 1,
        marginRight: 10
    },
    closeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    closeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B'
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#fff',
        position: 'relative' // Needed for loader absolute positioning
    },
    image: {
        width: '100%',
        height: '100%'
    },
    webview: {
        flex: 1,
        width: '100%',
        height: '100%'
    },
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.7)' // Semi-transparent bg for better UX
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorText: {
        marginTop: 10,
        color: theme.colors.textSecondary
    }
});
