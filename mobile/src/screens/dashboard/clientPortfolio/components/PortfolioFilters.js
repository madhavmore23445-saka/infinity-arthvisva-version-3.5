import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Keyboard, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../../../constants/theme';
import { categories } from '../data/categories';

const FilterSelect = ({ label, value, options, onSelect }) => {
    const [visible, setVisible] = useState(false);

    return (
        <View style={styles.filterGroup}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.selectBox, visible && styles.activeSelectBox]}
                onPress={() => {
                    Keyboard.dismiss();
                    setVisible(true);
                }}
            >
                <Text style={styles.selectText} numberOfLines={1}>
                    {value || 'Select'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                >
                    <View style={styles.pickerContainer}>
                        <View style={styles.pickerHeader}>
                            <View>
                                <Text style={styles.pickerTitle}>Select {label}</Text>
                                <Text style={styles.pickerSubtitle}>Refine your portfolio view</Text>
                            </View>
                            <TouchableOpacity style={styles.closeIcon} onPress={() => setVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.optionsList}>
                            {options.map((opt) => (
                                <TouchableOpacity
                                    key={opt}
                                    style={[
                                        styles.pickerOption,
                                        value === opt && styles.selectedOption
                                    ]}
                                    onPress={() => {
                                        onSelect(opt);
                                        setVisible(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.pickerOptionText,
                                        value === opt && styles.selectedOptionText
                                    ]}>
                                        {opt}
                                    </Text>
                                    {value === opt && (
                                        <LinearGradient
                                            colors={['#1CADA3', '#2076C7']}
                                            style={styles.checkCircle}
                                        >
                                            <Ionicons name="checkmark" size={14} color="#FFF" />
                                        </LinearGradient>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const PortfolioFilters = ({
    selectedCategory,
    setSelectedCategory,
    selectedProduct,
    setSelectedProduct
}) => {
    const categoryList = Object.keys(categories);
    const productList = categories[selectedCategory] || ['All'];

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <FilterSelect
                    label="CATEGORY"
                    value={selectedCategory}
                    options={categoryList}
                    onSelect={setSelectedCategory}
                />
                <FilterSelect
                    label="PRODUCT"
                    value={selectedProduct}
                    options={productList}
                    onSelect={setSelectedProduct}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    filterGroup: {
        flex: 1,
    },
    label: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94A3B8',
        marginBottom: 8,
        letterSpacing: 1,
    },
    selectBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 52,
        backgroundColor: '#FFF',
        ...theme.shadow,
    },
    activeSelectBox: {
        borderColor: '#2076C7',
        backgroundColor: '#F8FAFF',
    },
    selectText: {
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'center',
        padding: 24,
    },
    pickerContainer: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        maxHeight: '70%',
        ...theme.shadow,
        overflow: 'hidden',
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
    },
    pickerSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
        fontWeight: '500',
    },
    closeIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionsList: {
        padding: 12,
    },
    pickerOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 4,
    },
    selectedOption: {
        backgroundColor: '#F0F9FF',
    },
    pickerOptionText: {
        fontSize: 15,
        color: '#475569',
        fontWeight: '600',
    },
    selectedOptionText: {
        color: '#2076C7',
        fontWeight: '700',
    },
    checkCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PortfolioFilters;
