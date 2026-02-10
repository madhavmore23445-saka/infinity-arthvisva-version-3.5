import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    SafeAreaView,
    ActivityIndicator,
    Modal,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
// import { DashboardService } from '../../../../../services/dashboardService';
// import theme from '../../../../../constants/theme';
import { useNavigation } from '@react-navigation/native';
// import DatePickerInput from '../../../../../components/common/DatePickerInput';

import theme from '../../../../../constants/theme';
import { DashboardService } from '../../../../../services/dashboardService';
import DatePickerInput from '../../../../../components/common/DatePickerInput';
import GradientButton from '../../../../../components/common/GradientButton';

const MAX_FILE_SIZE_BYTES = 200 * 1024; // 200KB

const BASE_DOCS = ["Aadhar Card", "Pan Card", "3 Months Salary Slip", "Form 16", "6 Months Banking Statement", "Address Proof", "Photograph", "Company ID Card"];
const getDocKey = (label) => label.toUpperCase().replace(/\s+/g, '_');

const CustomPicker = ({ label, value, options, onSelect, error }) => {
    const [modalVisible, setModalVisible] = useState(false);
    return (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label} <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
                style={[styles.input, styles.pickerInput, error && styles.inputError]}
                onPress={() => setModalVisible(true)}
            >
                <Text style={value ? styles.inputText : styles.placeholderText}>{value || `Select`}</Text>
                <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Modal visible={modalVisible} transparent animationType="slide">
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
                                <TouchableOpacity
                                    key={opt}
                                    style={styles.pickerOption}
                                    onPress={() => { onSelect(opt); setModalVisible(false); }}
                                    activeOpacity={0.7}
                                >
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

export default function PersonalLoanFormScreen() {
    const navigation = useNavigation();
    const [form, setForm] = useState({
        clientName: "", phone: "", email: "", dob: "", location: "", loanAmount: "",
        deductionDetails: "", companyName: "", companyAddress: "", hasOtherLoan: "No", otherLoanAmount: ""
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileQueue, setFileQueue] = useState([]);
    const [statusMsg, setStatusMsg] = useState("");

    const requiredDocs = useMemo(() =>
        form.hasOtherLoan === "Yes" ? [...BASE_DOCS, "Existing Loan Statement"] : BASE_DOCS,
        [form.hasOtherLoan]);

    const handleInputChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const validate = () => {
        const errs = {};
        const req = (f) => { if (!form[f]?.trim()) errs[f] = "Required"; };
        ["clientName", "location", "dob", "loanAmount", "deductionDetails", "companyName", "companyAddress"].forEach(req);
        if (!form.phone || form.phone.length !== 10) errs.phone = "Invalid phone";
        // Basic email check
        if (!form.email || !form.email.includes('@')) errs.email = "Invalid email";

        if (form.hasOtherLoan === "Yes" && !form.otherLoanAmount) errs.otherLoanAmount = "Required";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const pickDocument = async (label, allowMultiple) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true,
                multiple: allowMultiple
            });

            if (!result.canceled && result.assets) {
                const newFiles = result.assets.filter(file => {
                    if (file.size > MAX_FILE_SIZE_BYTES) {
                        Alert.alert("File Too Large", `File "${file.name}" exceeds 200KB limit.`);
                        return false;
                    }
                    return true;
                }).map(file => ({
                    file,
                    label,
                    key: getDocKey(label),
                    status: 'pending'
                }));

                setFileQueue(prev => {
                    const filtered = allowMultiple ? prev : prev.filter(f => f.label !== label);
                    return [...filtered, ...newFiles];
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const removeFile = (label, fileName) => {
        setFileQueue(prev => prev.filter(f => !(f.label === label && f.file.name === fileName)));
    };

    const handleSubmit = async () => {
        if (!validate()) {
            Alert.alert("Validation Error", "Please fill all required fields");
            return;
        }
        setIsSubmitting(true);
        setStatusMsg("Creating Application...");

        try {
            const payload = {
                department: "Loan", product_type: "Personal Loan", sub_category: "Personal Loan",
                client: { name: form.clientName, mobile: form.phone, email: form.email },
                meta: { is_self_login: false },
                form_data: { ...form }
            };

            const result = await DashboardService.createLead(payload);
            const leadId = result?.detail_lead_id;
            if (!leadId) throw new Error("Lead ID missing");

            // Upload files sequentially
            for (let i = 0; i < fileQueue.length; i++) {
                const item = fileQueue[i];

                setFileQueue(prev => prev.map((q, idx) => idx === i ? { ...q, status: 'uploading' } : q));
                setStatusMsg(`Uploading: ${item.label}`);

                const formData = new FormData();
                formData.append("leadDbId", leadId);
                formData.append("metadata", JSON.stringify([{ key: item.key, label: item.label }]));

                const fileObj = {
                    uri: item.file.uri,
                    name: item.file.name,
                    type: item.file.mimeType || 'application/octet-stream'
                };
                formData.append("documents", fileObj);

                try {
                    await DashboardService.uploadLeadDocument(leadId, formData);
                    setFileQueue(prev => prev.map((q, idx) => idx === i ? { ...q, status: 'success' } : q));
                } catch (err) {
                    setFileQueue(prev => prev.map((q, idx) => idx === i ? { ...q, status: 'error' } : q));
                    // Don't throw, try next file or just alert? web throws. I'll continue for mobile but alert.
                    console.error(err);
                    Alert.alert("Upload Failed", `Failed to upload ${item.label}`);
                }
            }

            Alert.alert("Success", "Application Submitted!");
            navigation.goBack();

        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to submit application");
        } finally {
            setIsSubmitting(false);
            setStatusMsg("");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Personal Loan Form</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Personal Info Card */}
                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Applicant Details</Text>

                    <InputGroup label="Client Name" required value={form.clientName} onChange={v => handleInputChange("clientName", v)} error={errors.clientName} placeholder="Enter full name" />
                    <InputGroup label="Phone Number" required keyboardType="numeric" maxLength={10} value={form.phone} onChange={v => handleInputChange("phone", v)} error={errors.phone} placeholder="10-digit number" />
                    <InputGroup label="Email ID" required keyboardType="email-address" value={form.email} onChange={v => handleInputChange("email", v)} error={errors.email} placeholder="Enter email" />

                    <DatePickerInput
                        label="Date of Birth"
                        required
                        value={form.dob}
                        onChange={v => handleInputChange("dob", v)}
                        maximumDate={new Date()}
                        error={errors.dob}
                    />

                    <InputGroup label="Location" required value={form.location} onChange={v => handleInputChange("location", v)} error={errors.location} placeholder="Enter city" />
                </View>

                {/* Employment / Loan Details Card */}
                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Employment & Loan Info</Text>

                    <InputGroup label="Loan Amount" required keyboardType="numeric" value={form.loanAmount} onChange={v => handleInputChange("loanAmount", v)} error={errors.loanAmount} placeholder="Amount (₹)" />
                    <InputGroup label="Deduction Details" required value={form.deductionDetails} onChange={v => handleInputChange("deductionDetails", v)} error={errors.deductionDetails} placeholder="E.g. PF, Tax" />

                    <View style={styles.divider} />

                    <InputGroup label="Company Name" required value={form.companyName} onChange={v => handleInputChange("companyName", v)} error={errors.companyName} placeholder="Company Name" />
                    <InputGroup label="Company Address" required value={form.companyAddress} onChange={v => handleInputChange("companyAddress", v)} error={errors.companyAddress} placeholder="Company Address" />

                    <View style={styles.divider} />

                    <CustomPicker label="Any Other Loan Obligations?" required value={form.hasOtherLoan} options={["Yes", "No"]} onSelect={v => handleInputChange("hasOtherLoan", v)} error={errors.hasOtherLoan} />
                    {form.hasOtherLoan === "Yes" && (
                        <InputGroup label="Existing Loan Amount" required keyboardType="numeric" value={form.otherLoanAmount} onChange={v => handleInputChange("otherLoanAmount", v)} error={errors.otherLoanAmount} placeholder="Enter amount" />
                    )}
                </View>

                {/* Documents Card */}
                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Upload Documents</Text>
                    <Text style={styles.cardSubHeader}>Max file size: 200KB per document</Text>

                    <View style={styles.docList}>
                        {requiredDocs.map(lbl => {
                            const files = fileQueue.filter(f => f.label === lbl);
                            const allowMultiple = !["Aadhar Card", "Pan Card"].includes(lbl);
                            const filled = files.length > 0;

                            return (
                                <View key={lbl} style={[styles.docItem, filled && styles.docItemFilled]}>
                                    <View style={styles.docItemHeader}>
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <Text style={styles.docTitle}>{lbl}</Text>
                                                {filled && <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />}
                                            </View>
                                            {allowMultiple && <Text style={styles.docType}>Multiple files allowed</Text>}
                                        </View>

                                        <TouchableOpacity style={styles.uploadBtnSmall} onPress={() => pickDocument(lbl, allowMultiple)}>
                                            <Ionicons name="add" size={16} color="#fff" />
                                            <Text style={styles.uploadBtnSmallText}>{filled ? "Add" : "Browse"}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {files.length > 0 && (
                                        <View style={styles.fileChipsContainer}>
                                            {files.map((f, i) => (
                                                <View key={i} style={styles.fileChip}>
                                                    {f.status === 'uploading' ? <ActivityIndicator size="small" color={theme.colors.brandBlue} /> :
                                                        <Ionicons name={f.status === 'success' ? "checkmark-circle" : f.status === 'error' ? "alert-circle" : "document-text"} size={14} color={f.status === 'success' ? theme.colors.success : theme.colors.textSecondary} />
                                                    }
                                                    <Text style={styles.chipText} numberOfLines={1}>{f.file.name}</Text>
                                                    {f.status === 'pending' && <TouchableOpacity onPress={() => removeFile(lbl, f.file.name)}><Ionicons name="close-circle" size={16} color={theme.colors.textSecondary} /></TouchableOpacity>}
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>

                <GradientButton
                    onPress={handleSubmit}
                    title="Submit Application"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={{ marginTop: 16, borderRadius: 10 }}
                />

            </ScrollView>
        </SafeAreaView>
    );
}

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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingTop: Platform.OS === 'android' ? 40 : 16 // Safety for status bar
    },
    backBtn: { padding: 8, marginRight: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    content: { padding: 16, paddingBottom: 40 },

    // Cards
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 16
    },
    cardHeader: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
    cardSubHeader: { fontSize: 12, color: '#64748B', marginBottom: 16, marginTop: -12 },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },

    // Inputs
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 6, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
    required: { color: theme.colors.error },
    input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 14, color: '#1E293B', backgroundColor: '#fff' },
    inputError: { borderColor: theme.colors.error },
    errorText: { color: theme.colors.error, fontSize: 12, marginTop: 4 },

    // Pickers
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

    // Docs
    docList: { gap: 12 },
    docItem: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, backgroundColor: '#F8FAFC' },
    docItemFilled: { backgroundColor: '#fff', borderColor: '#CBD5E1' },
    docItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    docTitle: { fontWeight: '600', fontSize: 14, color: '#334155' },
    docType: { fontSize: 11, color: '#94A3B8', marginTop: 2 },

    uploadBtnSmall: { backgroundColor: theme.colors.brandBlue, flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, gap: 4 },
    uploadBtnSmallText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

    fileChipsContainer: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    fileChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F1F5F9', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0', maxWidth: '100%' },
    chipText: { fontSize: 12, color: '#475569', maxWidth: 120 },

    // Footer
    submitBtn: { backgroundColor: theme.colors.brandBlue, padding: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center', shadowColor: theme.colors.brandBlue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, marginTop: 16 },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
    disabledBtn: { opacity: 0.7 }
});
