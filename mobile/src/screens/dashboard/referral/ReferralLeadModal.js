import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashboardService } from '../../../services/dashboardService';
import { productKeyMap, subProductOptions } from '../data/productData';
import theme from '../../../constants/theme';
import GradientButton from '../../../components/common/GradientButton';

const SelectInput = ({ label, value, options, onSelect, error, placeholder = "Select" }) => {
    const [visible, setVisible] = useState(false);

    return (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label} <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
                style={[styles.input, styles.selectInput, error && styles.inputError]}
                onPress={() => {
                    Keyboard.dismiss();
                    setVisible(true);
                }}
            >
                <Text style={value ? styles.inputText : styles.placeholderText}>
                    {value || placeholder}
                </Text>
                <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Modal visible={visible} transparent animationType="slide">
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setVisible(false)}>
                    <View style={styles.pickerContainer}>
                        <ScrollView>
                            {options.map((opt) => (
                                <TouchableOpacity
                                    key={opt}
                                    style={styles.pickerOption}
                                    onPress={() => {
                                        onSelect(opt);
                                        setVisible(false);
                                    }}
                                >
                                    <Text style={styles.pickerOptionText}>{opt}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.closePickerConfig} onPress={() => setVisible(false)}>
                            <Text style={styles.closePickerText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default function ReferralLeadModal({ visible, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        leadName: "",
        contactNumber: "",
        emailAddress: "",
        product: "",
        subProduct: "",
        additionalNotes: "",
    });

    const [validationErrors, setValidationErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const ALLOWED_DOMAINS = [
        "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "live.com"
    ];

    useEffect(() => {
        if (visible) {
            setFormData({
                leadName: "",
                contactNumber: "",
                emailAddress: "",
                product: "",
                subProduct: "",
                additionalNotes: "",
            });
            setValidationErrors({});
        }
    }, [visible]);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (validationErrors[key]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[key];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.leadName.trim()) errors.leadName = "Client name is required";

        const cleanedContact = formData.contactNumber.replace(/\D/g, "");
        if (!cleanedContact) {
            errors.contactNumber = "Contact number is required";
        } else if (cleanedContact.length !== 10) {
            errors.contactNumber = "Contact number must be 10 digits";
        }

        if (!formData.product) errors.product = "Product selection is required";

        if (formData.emailAddress) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.emailAddress)) {
                errors.emailAddress = "Enter a valid email format";
            } else {
                const domain = formData.emailAddress.split("@")[1];
                if (!ALLOWED_DOMAINS.includes(domain)) {
                    errors.emailAddress = `Domain "@${domain}" is not supported.`;
                }
            }
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            const payload = {
                lead_name: formData.leadName.trim(),
                contact_number: formData.contactNumber.replace(/\D/g, ""),
                email: formData.emailAddress.trim() || "",
                department: formData.product,
                sub_category: formData.subProduct || "",
                notes: formData.additionalNotes.trim() || "",
            };
            const response = await DashboardService.createReferralLead(payload);
            if (response.success) {
                Alert.alert("Success", "Referral lead created successfully");
                onSuccess?.();
                onClose();
            } else {
                Alert.alert("Error", response.message || "Failed to create lead");
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "An unexpected error occurred";
            Alert.alert("Error", msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.overlay}
            >
                <TouchableOpacity style={styles.overlayTouch} onPress={onClose} activeOpacity={1}>
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Add New Lead</Text>
                            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Client Name <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={[styles.input, validationErrors.leadName && styles.inputError]}
                                    value={formData.leadName}
                                    onChangeText={(text) => handleChange("leadName", text)}
                                    placeholder="Enter client name"
                                    placeholderTextColor={theme.colors.textSecondary}
                                />
                                {validationErrors.leadName && <Text style={styles.errorText}>{validationErrors.leadName}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Contact Number <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={[styles.input, validationErrors.contactNumber && styles.inputError]}
                                    value={formData.contactNumber}
                                    onChangeText={(text) => handleChange("contactNumber", text)}
                                    placeholder="Enter contact number"
                                    keyboardType="numeric"
                                    maxLength={10}
                                    placeholderTextColor={theme.colors.textSecondary}
                                />
                                {validationErrors.contactNumber && <Text style={styles.errorText}>{validationErrors.contactNumber}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email Address</Text>
                                <TextInput
                                    style={[styles.input, validationErrors.emailAddress && styles.inputError]}
                                    value={formData.emailAddress}
                                    onChangeText={(text) => handleChange("emailAddress", text.toLowerCase())}
                                    placeholder="Enter email address"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor={theme.colors.textSecondary}
                                />
                                {validationErrors.emailAddress && <Text style={styles.errorText}>{validationErrors.emailAddress}</Text>}
                            </View>

                            <SelectInput
                                label="Product"
                                value={formData.product}
                                options={Object.keys(productKeyMap)}
                                onSelect={(val) => handleChange("product", val)}
                                error={validationErrors.product}
                            />

                            {formData.product && subProductOptions[productKeyMap[formData.product]] && (
                                <SelectInput
                                    label="Sub Product"
                                    value={formData.subProduct}
                                    options={subProductOptions[productKeyMap[formData.product]]}
                                    onSelect={(val) => handleChange("subProduct", val)}
                                />
                            )}

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Additional Notes</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={formData.additionalNotes}
                                    onChangeText={(text) => handleChange("additionalNotes", text)}
                                    placeholder="Any specific requirements..."
                                    multiline
                                    numberOfLines={3}
                                    placeholderTextColor={theme.colors.textSecondary}
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <GradientButton
                                onPress={handleSubmit}
                                title="Save Lead"
                                loading={isSubmitting}
                                disabled={isSubmitting}
                                style={{ flex: 2, paddingVertical: 0, height: 48, borderRadius: 12 }}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: theme.spacing.md,
    },
    overlayTouch: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: theme.colors.white,
        borderRadius: 24,
        width: '100%',
        maxHeight: '90%',
        ...theme.shadow,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.primary,
        letterSpacing: -0.5,
    },
    formContent: {
        padding: theme.spacing.md,
    },
    inputGroup: {
        marginBottom: theme.spacing.md,
    },
    label: {
        ...theme.typography.caption,
        color: theme.colors.text,
        marginBottom: 6,
    },
    required: {
        color: theme.colors.error,
    },
    input: {
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        color: theme.colors.text,
        backgroundColor: '#F8FAFC',
        fontWeight: '500',
    },
    selectInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 4,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    placeholderText: {
        color: theme.colors.textSecondary,
    },
    inputText: {
        color: theme.colors.text,
    },
    footer: {
        flexDirection: 'row',
        padding: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 14,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    submitButton: {
        flex: 2,
        padding: 14,
        backgroundColor: theme.colors.primary,
        borderRadius: 12,
        alignItems: 'center',
        ...theme.shadow,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: theme.colors.white,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    pickerContainer: {
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
        maxHeight: '60%',
        paddingBottom: 20,
    },
    pickerOption: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.surface,
    },
    pickerOptionText: {
        fontSize: 16,
        color: theme.colors.text,
    },
    closePickerConfig: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
    },
    closePickerText: {
        color: theme.colors.error,
        fontWeight: '700',
    },
});
