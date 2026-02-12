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
import { DashboardService } from '../../../../../services/dashboardService';
import theme from '../../../../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import GradientButton from '../../../../../components/common/GradientButton';

const TRANSIT_MODES = ["Rail", "Road", "Courier", "Sea", "Air"];

export default function MarineInsuranceFormScreen() {
    const navigation = useNavigation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [form, setForm] = useState({
        proposer: "", policyNo: "", address: "", business: "", insurancePeriod: "",
        subjectMatter: "", packing: "", transitFrom: "", transitTo: "",
        transitMode: "", valuation: "", sumAssured: "", bottomLimit: "", locationLimit: ""
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const validate = () => {
        const errs = {};
        const req = (f, msg) => { if (!String(form[f] || "").trim()) errs[f] = msg; };

        req("proposer", "Proposer name is required");
        req("policyNo", "Policy number is required");
        req("address", "Address is required");
        req("business", "Business nature is required");
        req("insurancePeriod", "Period is required");
        req("subjectMatter", "Cargo details are required");
        req("packing", "Packing nature is required");
        req("transitFrom", "Transit from is required");
        req("transitTo", "Transit to is required");
        req("transitMode", "Select transit mode");
        req("valuation", "Valuation basis is required");
        req("sumAssured", "Sum assured is required");
        req("bottomLimit", "Bottom limit is required");
        req("locationLimit", "Location limit is required");

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
                department: "Insurance",
                product_type: "Marine Insurance",
                sub_category: "Marine Insurance",
                client: {
                    name: form.proposer,
                    mobile: "NA",
                    email: "NA",
                },
                meta: {
                    is_self_login: false,
                },
                form_data: {
                    policyNo: form.policyNo,
                    address: form.address,
                    business: form.business,
                    insurancePeriod: form.insurancePeriod,
                    subjectMatter: form.subjectMatter,
                    packing: form.packing,
                    transitFrom: form.transitFrom,
                    transitTo: form.transitTo,
                    transitMode: form.transitMode,
                    valuation: form.valuation,
                    sumAssured: form.sumAssured
                }
            };

            const result = await DashboardService.createLead(payload);
            const leadId = result?.detail_lead_id;

            Alert.alert("Success", "Marine Insurance Application Submitted!", [
                { text: "OK", onPress: () => navigation.navigate("LeadManagement") }
            ]);

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
                <Text style={styles.headerTitle}>Marine Insurance</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Proposer Details</Text>
                    <InputGroup label="Name of Proposer" required value={form.proposer} onChange={v => handleInputChange("proposer", v)} error={errors.proposer} />
                    <InputGroup label="Expiring Policy No" required value={form.policyNo} onChange={v => handleInputChange("policyNo", v)} error={errors.policyNo} />
                    <InputGroup label="Proposer Address" required value={form.address} onChange={v => handleInputChange("address", v)} error={errors.address} />
                    <InputGroup label="Nature of Business" required value={form.business} onChange={v => handleInputChange("business", v)} error={errors.business} />
                    <InputGroup label="Period of Insurance" required value={form.insurancePeriod} onChange={v => handleInputChange("insurancePeriod", v)} error={errors.insurancePeriod} placeholder="e.g. 12 Months" />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Cargo & Transit Details</Text>
                    <InputGroup label="Subject Matter (Cargo Details)" required value={form.subjectMatter} onChange={v => handleInputChange("subjectMatter", v)} error={errors.subjectMatter} />
                    <InputGroup label="Nature of Packing" required value={form.packing} onChange={v => handleInputChange("packing", v)} error={errors.packing} placeholder="e.g. Wooden Crates, Bags" />

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ flex: 1 }}>
                            <InputGroup label="Transit From" required value={form.transitFrom} onChange={v => handleInputChange("transitFrom", v)} error={errors.transitFrom} placeholder="Origin" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <InputGroup label="Transit To" required value={form.transitTo} onChange={v => handleInputChange("transitTo", v)} error={errors.transitTo} placeholder="Destination" />
                        </View>
                    </View>

                    <CustomPicker
                        label="Mode Of Transit"
                        required
                        value={form.transitMode}
                        options={TRANSIT_MODES}
                        onSelect={v => handleInputChange("transitMode", v)}
                        error={errors.transitMode}
                    />

                    <InputGroup label="Basis of Valuation" required value={form.valuation} onChange={v => handleInputChange("valuation", v)} error={errors.valuation} placeholder="e.g. Invoice Value + 10%" />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Sum Assured & Limits</Text>
                    <InputGroup label="Sum Assured (₹)" required value={form.sumAssured} onChange={v => handleInputChange("sumAssured", v)} error={errors.sumAssured} keyboardType="numeric" />
                    <InputGroup label="Per Bottom Limit (₹)" required value={form.bottomLimit} onChange={v => handleInputChange("bottomLimit", v)} error={errors.bottomLimit} keyboardType="numeric" placeholder="Limit per transit" />
                    <InputGroup label="Per Location Limit (₹)" required value={form.locationLimit} onChange={v => handleInputChange("locationLimit", v)} error={errors.locationLimit} keyboardType="numeric" placeholder="Limit per location" />
                </View>

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

// --- Reusable Components ---
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
});