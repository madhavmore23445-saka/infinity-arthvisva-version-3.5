import React, { useState } from 'react';
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
import Toast, { BaseToast } from 'react-native-toast-message';
import { DashboardService } from '../../../../../services/dashboardService';
import theme from '../../../../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import GradientButton from '../../../../../components/common/GradientButton';
import DatePickerInput from '../../../../../components/common/DatePickerInput';

// Constants from web
const SAFETY_TYPES = [
    "Corporate Bonds",
    "Sovereign Gold Bonds",
    "Government Bonds",
    "Municipal Bonds",
];

const TENURE_OPTIONS = ["1 Year", "2 Years", "3 Years", "5 Years", "10 Years", "15 Years", "20 Years", "25 Years", "30 Years"];

export default function BondsFormScreen() {
    const navigation = useNavigation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [form, setForm] = useState({
        clientName: "", phone: "", email: "", dob: "", location: "",
        depositAmount: "", monthlyIncome: "", safetyType: ""
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const validate = () => {
        const errs = {};
        const req = (f, msg) => { if (!String(form[f] || "").trim()) errs[f] = msg; };

        req("clientName", "Client name is required");
        req("dob", "Date of birth is required");
        req("location", "Location is required");
        req("depositAmount", "Deposit amount is required");
        req("monthlyIncome", "Monthly income is required");
        req("safetyType", "Select safety type");

        // if (form.pincode) {
        //     if (form.pincode.length !== 6) errs.pincode = "6 digit Pincode required";
        // } else {
        //     errs.pincode = "Pincode is required";
        // }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            Alert.alert("Error", "Please fill all required fields correctly.");
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                department: "Investment",
                product_type: "Bonds",
                sub_category: "Bonds",
                client: {
                    name: form.clientName,
                    mobile: form.phone, // Web app sends NA for these in loan protector form
                    email: form.email,
                },
                meta: {
                    is_self_login: false,
                },
                form_data: {
                    dob: form.dob,
                    location: form.location,
                    depositAmount: form.depositAmount,
                    monthlyIncome: form.monthlyIncome,
                    safetyType: form.safetyType
                }
            };

            const result = await DashboardService.createLead(payload);
            const leadId = result?.detail_lead_id;
            setForm({})

            Toast.show({
                type: 'success',
                text1: 'Application Submitted',
                text2: 'Loan Protector application submitted successfully.',
                position: 'top',
                visibilityTime: 1800,
                autoHide: true,
                topOffset: 20,
                onHide: () => {
                    navigation.navigate('LeadManagement');
                },
            });
            // Alert.alert("Success", "Loan Protector Application Submitted!", [
            //     { text: "OK", onPress: () => navigation.navigate("LeadManagement") }
            // ]);

        } catch (err) {
            console.error("Submission error:", err);
            Alert.alert("Error", err.response?.data?.message || "Failed to submit application.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Loan Protector Plan</Text>
                    <Text style={styles.subHeader}>Secure your liability</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Applicant Details</Text>

                    <InputGroup label="Full Name" required value={form.clientName} onChange={v => handleInputChange("clientName", v)} error={errors.clientName} placeholder="Enter full name" />

                     <InputGroup label="Client phone" required value={form.phone} onChange={v => handleInputChange("phone", v)} error={errors.phone} placeholder="Enter full name" />

                      <InputGroup label="Client Email ID" required value={form.email} onChange={v => handleInputChange("email", v)} error={errors.email} placeholder="Enter Client Email ID" />

                    <DatePickerInput
                        label="Date of Birth"
                        required
                        value={form.dob}
                        onChange={v => handleInputChange("dob", v)}
                        maximumDate={new Date()}
                        error={errors.dob}
                    />

                    <InputGroup label="location" required value={form.location} onChange={v => handleInputChange("location", v)} error={errors.location}  maxLength={6} placeholder="6-digit pincode" />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Loan Details</Text>

                    <InputGroup label="Lumpsum Deposit Amount" required value={form.depositAmount} onChange={v => handleInputChange("depositAmount", v)} error={errors.depositAmount} keyboardType="numeric" placeholder="Outstanding amount" />


                    <InputGroup label="Total Monthly Income" required value={form.monthlyIncome} onChange={v => handleInputChange("monthlyIncome", v)} error={errors.monthlyIncome} placeholder="Enter mnthly income" />

                    <CustomPicker
                        label="Safety Type"
                        required
                        value={form.safetyType}
                        options={SAFETY_TYPES}
                        onSelect={v => handleInputChange("safetyType", v)}
                        error={errors.loanType}
                    />

                </View>

                <Text style={styles.note}>Note: Coverage is subject to eligibility and verification.</Text>

            </ScrollView>

            <View style={styles.footer}>
                <GradientButton
                    onPress={handleSubmit}
                    title={isSubmitting ? "Submitting..." : "Submit Application"}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={{ borderRadius: 10, paddingVertical: 16 }}
                />
            </View>
        </SafeAreaView>
    );
}

// --- Reusable Components (Same as Corporate Form) ---

const InputGroup = ({ label, value, onChange, placeholder, required, error, keyboardType, maxLength }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
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

const CustomPicker = ({ label, value, options, onSelect, error, required }) => {
    const [modalVisible, setModalVisible] = React.useState(false);
    return (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
            <TouchableOpacity
                style={[styles.input, styles.pickerInput, error && styles.inputError]}
                onPress={() => setModalVisible(true)}
            >
                <Text style={value ? styles.inputText : styles.placeholderText}>{value || `Select`}</Text>
                <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.pickerModal}>
                        <View style={styles.pickerHeader}>
                            <Text style={styles.pickerTitle}>Select {label}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {options.map(opt => (
                                <TouchableOpacity key={opt} style={styles.pickerOption} onPress={() => { onSelect(opt); setModalVisible(false); }}>
                                    <Text style={[styles.pickerOptionText, value === opt && styles.selectedOptionText]}>{opt}</Text>
                                    {value === opt && <Ionicons name="checkmark-circle" size={22} color={theme.colors.brandTeal} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingTop: Platform.OS === 'android' ? 40 : 16 },
    backBtn: { padding: 8, marginRight: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    subHeader: { fontSize: 12, color: '#64748B', fontWeight: '600', textTransform: 'uppercase' },
    content: { padding: 16 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 16 },
    cardHeader: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 6, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
    required: { color: theme.colors.error },
    input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 14, color: '#1E293B', backgroundColor: '#fff' },
    inputError: { borderColor: theme.colors.error },
    errorText: { color: theme.colors.error, fontSize: 12, marginTop: 4 },
    pickerInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    inputText: { fontSize: 14, color: '#1E293B', fontWeight: '500' },
    placeholderText: { fontSize: 14, color: '#94A3B8' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    pickerModal: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '60%', paddingBottom: 20 },
    pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    pickerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    pickerOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
    pickerOptionText: { fontSize: 15, color: '#475569' },
    selectedOptionText: { color: theme.colors.brandTeal, fontWeight: '600' },
    footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
    note: { fontSize: 11, color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', marginTop: 8, marginBottom: 24 }
});