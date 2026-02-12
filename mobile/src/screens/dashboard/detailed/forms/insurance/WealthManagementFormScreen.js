import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    SafeAreaView,
    Platform,
    Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { DashboardService } from '../../../../../services/dashboardService';
import theme from '../../../../../constants/theme';
import DatePickerInput from '../../../../../components/common/DatePickerInput';
import GradientButton from '../../../../../components/common/GradientButton';

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------
const INCOME_TYPES = [
    "Salary Income",
    "Incentives / Commission",
    "Business Income",
    "Rental Income",
    "Pension Income",
    "Other Income"
];

const RELATIONSHIPS = ["Spouse", "Child", "Parent", "Sibling", "Other"];

// ------------------------------------------------------------
// Reusable Form Field (unified input, select, date)
// ------------------------------------------------------------
const FormField = ({
    label,
    value,
    onChange,
    type = 'text',
    options = [],
    required = false,
    error,
    placeholder,
    keyboardType,
    maxLength,
    onlyNumber = false,
    maximumDate,
    style
}) => {
    // Handle numeric filtering
    const handleNumericChange = (text) => {
        const numeric = text.replace(/[^0-9]/g, '');
        onChange(numeric);
    };

    const handleChange = (val) => {
        if (onlyNumber) {
            handleNumericChange(val);
        } else {
            onChange(val);
        }
    };

    // Text / numeric input
    if (type === 'text' || type === 'number') {
        return (
            <InputGroup
                label={label}
                required={required}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                keyboardType={onlyNumber ? 'numeric' : keyboardType}
                maxLength={maxLength}
                error={error}
                style={style}
            />
        );
    }

    // Date picker
    if (type === 'date') {
        return (
            <DatePickerInput
                label={label}
                required={required}
                value={value}
                onChange={onChange}
                maximumDate={maximumDate || new Date()}
                error={error}
                style={style}
            />
        );
    }

    // Select dropdown
    if (type === 'select') {
        return (
            <CustomPicker
                label={label}
                required={required}
                value={value}
                options={options}
                onSelect={onChange}
                error={error}
                style={style}
            />
        );
    }

    return null;
};

// ------------------------------------------------------------
// InputGroup (text input) – preserved from original
// ------------------------------------------------------------
const InputGroup = ({ label, value, onChange, placeholder, required, error, keyboardType, maxLength, style }) => (
    <View style={[styles.inputGroup, style]}>
        <Text style={styles.label}>
            {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <TextInput
            style={[styles.input, error && styles.inputError]}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType={keyboardType}
            maxLength={maxLength}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

// ------------------------------------------------------------
// CustomPicker (select) – preserved and enhanced with error
// ------------------------------------------------------------
const CustomPicker = ({ label, value, options, onSelect, error, required, style }) => {
    const [modalVisible, setModalVisible] = React.useState(false);
    return (
        <View style={[styles.inputGroup, style]}>
            <Text style={styles.label}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            <TouchableOpacity
                style={[styles.input, styles.pickerInput, error && styles.inputError]}
                onPress={() => setModalVisible(true)}
            >
                <Text style={value ? styles.inputText : styles.placeholderText}>
                    {value || `Select ${label}`}
                </Text>
                <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <PlatformModal visible={modalVisible} onClose={() => setModalVisible(false)}>
                <View style={styles.pickerModal}>
                    <View style={styles.pickerHeader}>
                        <Text style={styles.pickerTitle}>Select {label}</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView>
                        {options.map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                style={styles.pickerOption}
                                onPress={() => {
                                    onSelect(opt);
                                    setModalVisible(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.pickerOptionText,
                                        value === opt && styles.selectedOptionText,
                                    ]}
                                >
                                    {opt}
                                </Text>
                                {value === opt && (
                                    <Ionicons name="checkmark-circle" size={22} color={theme.colors.brandTeal} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </PlatformModal>
        </View>
    );
};

// ------------------------------------------------------------
// PlatformModal – wrapper for modal consistency
// ------------------------------------------------------------
const PlatformModal = ({ visible, onClose, children }) => {
    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>{children}</View>
        </Modal>
    );
};

// ------------------------------------------------------------
// Success Modal (replicates web success dialog)
// ------------------------------------------------------------
const SuccessModal = ({ visible, onClose }) => {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.successOverlay}>
                <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                        <Ionicons name="checkmark-circle" size={64} color={theme.colors.brandTeal} />
                    </View>
                    <Text style={styles.successTitle}>Success!</Text>
                    <Text style={styles.successMessage}>
                        Your Wealth Management assessment has been submitted successfully.
                    </Text>
                    <TouchableOpacity style={styles.successButton} onPress={onClose}>
                        <Text style={styles.successButtonText}>Okay, Got it</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

// ------------------------------------------------------------
// Main Component – WealthManagementFormScreen
// ------------------------------------------------------------
export default function WealthManagementFormScreen() {
    const navigation = useNavigation();

    // --------------------------------------------------------
    // State
    // --------------------------------------------------------
    const [form, setForm] = useState({
        clientName: '',
        phone: '',
        email: '',
        dob: '',
        incomeType: '',
        monthlyIncome: '',
        totalDependents: '',
        rentalLiability: '',
        loanLiability: '',
        insuranceLiability: '',
        investmentLiability: '',
    });

    const [dependents, setDependents] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // --------------------------------------------------------
    // Sync dependents array with totalDependents count
    // --------------------------------------------------------
    useEffect(() => {
        const count = Math.min(Math.max(0, parseInt(form.totalDependents) || 0), 9);
        setDependents((prev) => {
            if (count === prev.length) return prev;
            if (count > prev.length) {
                const added = Array.from({ length: count - prev.length }, () => ({
                    id: Math.random().toString(36).substring(2, 11),
                    name: '',
                    dob: '',
                    relationship: '',
                }));
                return [...prev, ...added];
            }
            return prev.slice(0, count);
        });
    }, [form.totalDependents]);

    // --------------------------------------------------------
    // Handlers
    // --------------------------------------------------------
    const handleInputChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        // Clear field error if any
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleDependentChange = (id, field, value) => {
        setDependents((prev) =>
            prev.map((dep) => (dep.id === id ? { ...dep, [field]: value } : dep))
        );
        // Clear dependent field error
        const errorKey = `dep_${field}_${id}`;
        if (errors[errorKey]) {
            setErrors((prev) => ({ ...prev, [errorKey]: '' }));
        }
    };

    const addDependent = () => {
        if (dependents.length >= 9) return;
        handleInputChange('totalDependents', (dependents.length + 1).toString());
    };

    const removeDependent = (id) => {
        const newCount = Math.max(0, dependents.length - 1);
        handleInputChange('totalDependents', newCount.toString());
    };

    // --------------------------------------------------------
    // Validation (identical to web)
    // --------------------------------------------------------
    const validate = () => {
        const errs = {};

        // Required fields
        const requiredFields = [
            'clientName',
            'dob',
            'incomeType',
            'monthlyIncome',
            'totalDependents',
        ];
        requiredFields.forEach((field) => {
            if (!String(form[field] || '').trim()) {
                errs[field] = `${field === 'clientName' ? 'Name' : field} is required`;
            }
        });

        // Phone
        if (!form.phone) {
            errs.phone = 'Phone is required';
        } else if (form.phone.length !== 10) {
            errs.phone = 'Must be 10 digits';
        }

        // Email
        if (!form.email) {
            errs.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errs.email = 'Invalid email format';
        }

        // Dependents validation
        dependents.forEach((dep) => {
            if (!dep.name.trim()) errs[`dep_name_${dep.id}`] = 'Required';
            if (!dep.dob) errs[`dep_dob_${dep.id}`] = 'Required';
            if (!dep.relationship) errs[`dep_rel_${dep.id}`] = 'Required';
        });

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // --------------------------------------------------------
    // Submit Handler
    // --------------------------------------------------------
    const handleSubmit = async () => {
        if (!validate()) {
            // No alert – inline errors are displayed
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                department: 'Investment',
                product_type: 'Wealth Management',
                sub_category: 'Wealth Management',
                client: {
                    name: form.clientName,
                    mobile: form.phone,
                    email: form.email,
                },
                meta: {
                    is_self_login: false,
                },
                form_data: {
                    dob: form.dob,
                    totalDependents: form.totalDependents,
                    incomeType: form.incomeType,
                    monthlyIncome: form.monthlyIncome,
                    rentalLiability: form.rentalLiability || '0',
                    loanLiability: form.loanLiability || '0',
                    insuranceLiability: form.insuranceLiability || '0',
                    investmentLiability: form.investmentLiability || '0',
                },
            };

            await DashboardService.createLead(payload);
            setShowSuccess(true);
        } catch (err) {
            console.error('Submission error:', err);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --------------------------------------------------------
    // Render
    // --------------------------------------------------------
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Wealth Management Form</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* ----- Personal Information ----- */}
                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Personal Information</Text>

                    <FormField
                        label="Client Name"
                        required
                        value={form.clientName}
                        onChange={(v) => handleInputChange('clientName', v)}
                        error={errors.clientName}
                        placeholder="Enter full name"
                    />

                    <FormField
                        label="Client Phone No"
                        required
                        value={form.phone}
                        onChange={(v) => handleInputChange('phone', v)}
                        error={errors.phone}
                        placeholder="10-digit mobile"
                        onlyNumber
                        maxLength={10}
                        keyboardType="phone-pad"
                    />

                    <FormField
                        label="Client Email ID"
                        type="text"
                        required
                        value={form.email}
                        onChange={(v) => handleInputChange('email', v)}
                        error={errors.email}
                        placeholder="client@example.com"
                        keyboardType="email-address"
                    />

                    <FormField
                        label="Client Date of Birth"
                        type="date"
                        required
                        value={form.dob}
                        onChange={(v) => handleInputChange('dob', v)}
                        error={errors.dob}
                        maximumDate={new Date()}
                    />
                </View>

                {/* ----- Income Details ----- */}
                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Income Details</Text>

                    <FormField
                        label="Income Type"
                        type="select"
                        required
                        value={form.incomeType}
                        onChange={(v) => handleInputChange('incomeType', v)}
                        options={INCOME_TYPES}
                        error={errors.incomeType}
                    />

                    <FormField
                        label="Monthly Income (₹)"
                        required
                        value={form.monthlyIncome}
                        onChange={(v) => handleInputChange('monthlyIncome', v)}
                        error={errors.monthlyIncome}
                        placeholder="Enter amount"
                        onlyNumber
                    />

                    <FormField
                        label="Total No. of Dependents"
                        required
                        value={form.totalDependents}
                        onChange={(v) => handleInputChange('totalDependents', v)}
                        error={errors.totalDependents}
                        placeholder="0-9"
                        onlyNumber
                        maxLength={1}
                    />
                </View>

                {/* ----- Dependents Section (dynamic) ----- */}
                {dependents.length > 0 && (
                    <View style={styles.card}>
                        <View style={styles.dependentsHeader}>
                            <Text style={styles.cardHeader}>Dependents Details</Text>
                            <TouchableOpacity
                                style={styles.addDependentBtn}
                                onPress={addDependent}
                                disabled={dependents.length >= 9}
                            >
                                <Ionicons
                                    name="add"
                                    size={18}
                                    color={dependents.length >= 9 ? theme.colors.textSecondary : theme.colors.brandTeal}
                                />
                                <Text
                                    style={[
                                        styles.addDependentText,
                                        dependents.length >= 9 && styles.addDependentDisabled,
                                    ]}
                                >
                                    Add Dependent
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {dependents.map((dep, index) => (
                            <View key={dep.id} style={styles.dependentCard}>
                                {/* Remove button */}
                                <TouchableOpacity
                                    style={styles.removeDependentBtn}
                                    onPress={() => removeDependent(dep.id)}
                                >
                                    <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                                </TouchableOpacity>

                                <Text style={styles.dependentIndex}>Dependent #{index + 1}</Text>

                                <FormField
                                    label="Name"
                                    required
                                    value={dep.name}
                                    onChange={(v) => handleDependentChange(dep.id, 'name', v)}
                                    error={errors[`dep_name_${dep.id}`]}
                                    placeholder="Full name"
                                />

                                <FormField
                                    label="Date of Birth"
                                    type="date"
                                    required
                                    value={dep.dob}
                                    onChange={(v) => handleDependentChange(dep.id, 'dob', v)}
                                    error={errors[`dep_dob_${dep.id}`]}
                                    maximumDate={new Date()}
                                />

                                <FormField
                                    label="Relationship"
                                    type="select"
                                    required
                                    value={dep.relationship}
                                    onChange={(v) => handleDependentChange(dep.id, 'relationship', v)}
                                    options={RELATIONSHIPS}
                                    error={errors[`dep_rel_${dep.id}`]}
                                />
                            </View>
                        ))}
                    </View>
                )}

                {/* ----- Liabilities & Obligations (optional) ----- */}
                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Liabilities & Obligations</Text>

                    <FormField
                        label="Rental Liability"
                        value={form.rentalLiability}
                        onChange={(v) => handleInputChange('rentalLiability', v)}
                        placeholder="Monthly rent"
                        onlyNumber
                    />

                    <FormField
                        label="Loan Liability"
                        value={form.loanLiability}
                        onChange={(v) => handleInputChange('loanLiability', v)}
                        placeholder="Monthly EMIs"
                        onlyNumber
                    />

                    <FormField
                        label="Insurance Liability"
                        value={form.insuranceLiability}
                        onChange={(v) => handleInputChange('insuranceLiability', v)}
                        placeholder="Premium payments"
                        onlyNumber
                    />

                    <FormField
                        label="Investment Liability"
                        value={form.investmentLiability}
                        onChange={(v) => handleInputChange('investmentLiability', v)}
                        placeholder="SIPs/Commitments"
                        onlyNumber
                    />
                </View>

                {/* Submit button */}
                <View style={styles.submitContainer}>
                    <GradientButton
                        onPress={handleSubmit}
                        title={isSubmitting ? 'Submitting...' : 'Submit Application'}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        style={{ borderRadius: 10, paddingVertical: 16 }}
                    />
                </View>
            </ScrollView>

            {/* Success Modal */}
            <SuccessModal visible={showSuccess} onClose={() => navigation.goBack()} />
        </SafeAreaView>
    );
}

// ------------------------------------------------------------
// Styles
// ------------------------------------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingTop: Platform.OS === 'android' ? 40 : 16,
    },
    backBtn: {
        padding: 8,
        marginRight: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 16,
    },
    cardHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.brandTeal,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 6,
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    required: {
        color: theme.colors.error,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#1E293B',
        backgroundColor: '#fff',
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 4,
    },
    pickerInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputText: {
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '500',
    },
    placeholderText: {
        fontSize: 14,
        color: '#94A3B8',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    pickerModal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '60%',
        paddingBottom: 20,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    pickerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    pickerOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    pickerOptionText: {
        fontSize: 15,
        color: '#475569',
    },
    selectedOptionText: {
        color: theme.colors.brandTeal,
        fontWeight: '600',
    },
    dependentsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 12,
        marginBottom: 16,
    },
    addDependentBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
    },
    addDependentText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.brandTeal,
        marginLeft: 4,
    },
    addDependentDisabled: {
        color: theme.colors.textSecondary,
    },
    dependentCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        position: 'relative',
    },
    dependentIndex: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    removeDependentBtn: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 1,
        padding: 4,
    },
    submitContainer: {
        marginTop: 8,
        marginBottom: 16,
    },
    // Success Modal Styles
    successOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    successContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        maxWidth: 320,
        width: '100%',
    },
    successIcon: {
        marginBottom: 16,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 8,
    },
    successMessage: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 24,
    },
    successButton: {
        backgroundColor: theme.colors.brandTeal,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 32,
        width: '100%',
    },
    successButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});