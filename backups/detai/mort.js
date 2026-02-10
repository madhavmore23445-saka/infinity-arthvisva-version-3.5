


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
// import { DashboardService } from '../../../../services/dashboardService';
// import theme from '../../../../constants/theme';
import { useNavigation } from '@react-navigation/native';
// import DatePickerInput from '../../../../components/common/DatePickerInput';

import theme from '../../../../../constants/theme';
import { DashboardService } from '../../../../../services/dashboardService';
import DatePickerInput from '../../../../../components/common/DatePickerInput';


const MAX_FILE_SIZE_BYTES = 200 * 1024; // 200KB



const DOC_REGISTRY = {
    "Aadhar Card": { key: "AADHAAR", label: "Aadhar Card", multiple: false },
    "PAN Card": { key: "PAN", label: "PAN Card", multiple: false },
    "3 Months Salary Slip": { key: "SALARY_SLIP", label: "3 Months Salary Slip", multiple: true },
    "2 Years Form 16": { key: "FORM16", label: "2 Years Form 16", multiple: true },
    "6 Months Banking Statement": { key: "BANK_STATEMENT", label: "6 Months Banking Statement", multiple: true },
    "Address Proof": { key: "ADDRESS_PROOF", label: "Address Proof", multiple: false },
    "Photograph": { key: "PHOTO", label: "Photograph", multiple: false },
    "Property Cost Sheet / Index II": { key: "COST_SHEET", label: "Property Cost Sheet / Index II", multiple: true },
    "Own Contribution Proof": { key: "CONTRIBUTION_PROOF", label: "Own Contribution Proof", multiple: true },
    "Udyam Registration": { key: "UDYAM", label: "Udyam Registration", multiple: false },
    "Shop Act Licence": { key: "SHOP_ACT", label: "Shop Act Licence", multiple: false },
    "1 Current Banking Statement": { key: "CURRENT_BANK_STMT", label: "1 Current Banking Statement", multiple: true },
    "Saving Bank Account": { key: "SAVING_BANK_STMT", label: "Saving Bank Account", multiple: true },
    "3 Years ITR": { key: "ITR", label: "3 Years ITR", multiple: true },
    "GST Certificate": { key: "GST_CERTIFICATE", label: "GST Certificate", multiple: false },
    "Last 12 Months GST Returns": { key: "GST_RETURNS", label: "Last 12 Months GST Returns", multiple: true },
    "PPO (Pension Payment Order)": { key: "PPO", label: "PPO (Pension Payment Order)", multiple: false },
    "1 Year Pension Credit Statement": { key: "PENSION_STMT", label: "1 Year Pension Credit Statement", multiple: true },
    "Rent Agreement": { key: "RENT_AGREEMENT", label: "Rent Agreement", multiple: true },
    "1 Year Rent Credit Statement": { key: "RENT_STMT", label: "1 Year Rent Credit Statement", multiple: true },
    "Existing Loan Statement": { key: "EXISTING_LOAN", label: "Existing Loan Statement", multiple: true },
};

const DOC_MAP = {
    "Salaried Person": ["Aadhar Card", "PAN Card", "3 Months Salary Slip", "2 Years Form 16", "6 Months Banking Statement", "Address Proof", "Photograph", "Property Cost Sheet / Index II", "Own Contribution Proof"],
    "Self Employed": ["Aadhar Card", "PAN Card", "Udyam Registration", "Shop Act Licence", "1 Current Banking Statement", "Saving Bank Account", "Address Proof", "3 Years ITR", "GST Certificate", "Last 12 Months GST Returns", "Photograph", "Property Cost Sheet / Index II", "Own Contribution Proof"],
    "Pension": ["Aadhar Card", "PAN Card", "PPO (Pension Payment Order)", "1 Year Pension Credit Statement"],
    "Rental": ["Rent Agreement", "1 Year Rent Credit Statement"],
};

const LOAN_TYPES = ["Balance Transfer", "Fresh Mortgage Loan", "Loan Against Property", "Top-up Loan", "Lease Rental Discounting"];


const CustomPicke = () => {
    const [modalOverlay, setModalVisible] = useState(false);
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
            <Modal visible={modalVisible} transparent animationType="none">
                <View style={styles.modalOverlay}>
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

            </Modal>


        </View>
    )

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const CustomPicker = ({ label, value, options, onSelect, error, required }) => {
    const [modalVisible, setModalVisible] = useState(false);
    return (
        <View style={styles.inputGroup}>
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.pickerModal}
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
            </Modal >
        </View >
    );
};

export default function MortgageLoanFormScreen() {
    const navigation = useNavigation();
    const [step, setStep] = useState(1);
    const [leadId, setLeadId] = useState(null);
    const [form, setForm] = useState({
        clientName: "", phone: "", email: "", dob: "", location: "",
        loanAmount: "", loanType: "", employmentType: "",
        hasOtherLoan: "", otherLoanAmount: "", otherIncome: "", otherIncomeAmount: ""
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileQueue, setFileQueue] = useState([]);
    const [statusMsg, setStatusMsg] = useState("");

    const requiredDocsList = useMemo(() => {
        let docs = [...(DOC_MAP[form.employmentType] || [])];
        if (form.employmentType === "Other") docs.push(...(DOC_MAP[form.otherIncome] || []));
        if (form.hasOtherLoan === "Yes" && docs.length) docs.push("Existing Loan Statement");
        return [...new Set(docs)].map(label => DOC_REGISTRY[label]).filter(Boolean);
    }, [form, form.employmentType]);

    const handleInputChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const validateStep1 = () => {
        const errs = {};
        const req = (f, msg) => { if (!form[f]?.trim()) errs[f] = msg; };

        req("loanType", "Select a loan type");
        req("clientName", "Client Name is required");
        req("location", "Location is required");
        req("dob", "Date of Birth is required");
        req("loanAmount", "Loan Amount is required");
        req("employmentType", "Employment Type is required");

        if (!form.phone || form.phone.length !== 10) errs.phone = "Invalid phone";
        if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleCreateLead = async () => {
        if (!validateStep1()) return;
        setIsSubmitting(true);
        setStatusMsg("Creating Application...");
        try {
            const payload = {
                department: "Loan",
                product_type: "Mortgage Loan",
                sub_category: "Mortgage Loan",
                client: {
                    name: form.clientName,
                    mobile: form.phone,
                    email: form.email
                },
                meta: { is_self_login: false },
                form_data: {
                    loanType: form.loanType,
                    dob: form.dob,
                    location: form.location,
                    loanAmount: form.loanAmount,
                    employmentType: form.employmentType,
                    hasOtherLoan: form.hasOtherLoan,
                    otherLoanAmount: form.otherLoanAmount,
                    otherIncome: form.otherIncome || "N/A",
                    otherIncomeAmount: form.otherIncomeAmount || "0"
                }
            };

            const result = await DashboardService.createLead(payload);
            const id = result?.detail_lead_id;
            if (!id) throw new Error("Lead ID missing");
            setLeadId(id);
            setStep(2);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to create application");
        } finally {
            setIsSubmitting(false);
            setStatusMsg("");
        }
    };

    const pickDocument = async (docKey, label, allowMultiple) => {
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
                    docKey,
                    label,
                    status: 'pending'
                }));

                setFileQueue(prev => {
                    const filtered = allowMultiple ? prev : prev.filter(f => f.docKey !== docKey);
                    return [...filtered, ...newFiles];
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const removeFile = (docKey, fileName) => {
        setFileQueue(prev => prev.filter(f => !(f.docKey === docKey && f.file.name === fileName)));
    };

    const handleFinalSubmission = async () => {
        if (fileQueue.length === 0) {
            Alert.alert("Success", "Application Submitted!");
            navigation.goBack();
            return;
        }

        setIsSubmitting(true);
        for (let i = 0; i < fileQueue.length; i++) {
            const item = fileQueue[i];
            if (item.status === 'success') continue;

            setStatusMsg(`Uploading ${i + 1}/${fileQueue.length}: ${item.label}`);
            setFileQueue(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f));

            const formData = new FormData();
            formData.append("leadDbId", leadId);
            formData.append("metadata", JSON.stringify([{ key: item.docKey, label: item.label }]));

            const fileObj = {
                uri: item.file.uri,
                name: item.file.name,
                type: item.file.mimeType || 'application/octet-stream'
            };
            formData.append("documents", fileObj);

            try {
                await DashboardService.uploadLeadDocument(leadId, formData);
                setFileQueue(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'success' } : f));
            } catch (err) {
                console.error("Upload Error", err);
                setFileQueue(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error' } : f));
                Alert.alert("Upload Failed", `Failed to upload ${item.label}.`);
                setIsSubmitting(false);
                return;
            }
        }
        setIsSubmitting(false);
        Alert.alert("Success", "All documents uploaded successfully!");
        navigation.goBack();
    };

    const renderStep1 = () => (
        <View style={styles.formContainer}>
            <View style={styles.card}>
                <Text style={styles.cardHeader}>Loan Details</Text>
                <CustomPicker label="Type of Mortgage Loan" required value={form.loanType} options={LOAN_TYPES} onSelect={v => handleInputChange("loanType", v)} error={errors.loanType} />
                <InputGroup label="Loan Amount" required keyboardType="numeric" value={form.loanAmount} onChange={v => handleInputChange("loanAmount", v)} error={errors.loanAmount} placeholder="Enter Amount (₹)" />
            </View>

            <View style={styles.card}>
                <Text style={styles.cardHeader}>Personal Information</Text>
                <InputGroup label="Client Name" required value={form.clientName} onChange={v => handleInputChange("clientName", v)} error={errors.clientName} placeholder="Enter full name" />
                <InputGroup label="Phone Number" required keyboardType="numeric" maxLength={10} value={form.phone} onChange={v => handleInputChange("phone", v)} error={errors.phone} placeholder="10-digit number" />
                <InputGroup label="Email ID" required keyboardType="email-address" value={form.email} onChange={v => handleInputChange("email", v)} error={errors.email} placeholder="Enter email address" />
                <DatePickerInput label="Date of Birth" required value={form.dob} onChange={v => handleInputChange("dob", v)} maximumDate={new Date()} error={errors.dob} />
                <InputGroup label="Location" required value={form.location} onChange={v => handleInputChange("location", v)} error={errors.location} placeholder="Enter city" />
            </View>

            <View style={styles.card}>
                <Text style={styles.cardHeader}>Employment & Liabilities</Text>
                <CustomPicker label="Employment Type" required value={form.employmentType} options={["Salaried Person", "Self Employed", "Other"]} onSelect={v => handleInputChange("employmentType", v)} error={errors.employmentType} />

                {form.employmentType === "Other" && (
                    <>
                        <CustomPicker label="Other Income Source" required value={form.otherIncome} options={["Pension", "Rental"]} onSelect={v => handleInputChange("otherIncome", v)} error={errors.otherIncome} />
                        <InputGroup label="Approx Amount" required keyboardType="numeric" value={form.otherIncomeAmount} onChange={v => handleInputChange("otherIncomeAmount", v)} error={errors.otherIncomeAmount} placeholder="Enter amount" />
                    </>
                )}

                <View style={styles.divider} />
                <CustomPicker label="Any Other Loan Obligations?" required value={form.hasOtherLoan} options={["Yes", "No"]} onSelect={v => handleInputChange("hasOtherLoan", v)} error={errors.hasOtherLoan} />

                {form.hasOtherLoan === "Yes" && (
                    <InputGroup label="Existing Loan Amount" required keyboardType="numeric" value={form.otherLoanAmount} onChange={v => handleInputChange("otherLoanAmount", v)} error={errors.otherLoanAmount} placeholder="Amount" />
                )}
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.step2Container}>
            <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={28} color={theme.colors.success} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.successTitle}>Step 1 Completed</Text>
                    <Text style={styles.successSub}>Lead ID generated: {leadId}</Text>
                </View>
            </View>
            <View style={styles.card}>
                <Text style={styles.cardHeader}>Upload Documents</Text>
                <Text style={styles.cardSubHeader}>Max file size: 200KB per document</Text>
                <View style={styles.docList}>
                    {requiredDocsList.map((doc) => {
                        const files = fileQueue.filter(f => f.docKey === doc.key);
                        const filled = files.length > 0;
                        return (
                            <View key={doc.key} style={[styles.docItem, filled && styles.docItemFilled]}>
                                <View style={styles.docItemHeader}>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <Text style={styles.docTitle}>{doc.label}</Text>
                                            {filled && <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />}
                                        </View>
                                        <Text style={styles.docType}>{doc.multiple ? "Multiple files allowed" : "Single file"}</Text>
                                    </View>
                                    {(doc.multiple || !filled) && (
                                        <TouchableOpacity style={styles.uploadBtnSmall} onPress={() => pickDocument(doc.key, doc.label, doc.multiple)}>
                                            <Ionicons name="add" size={16} color="#fff" />
                                            <Text style={styles.uploadBtnSmallText}>{filled ? "Add" : "Upload"}</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                {files.length > 0 && (
                                    <View style={styles.fileChipsContainer}>
                                        {files.map((f, idx) => (
                                            <View key={idx} style={styles.fileChip}>
                                                <Ionicons
                                                    name={f.status === 'success' ? "checkmark-circle" : f.status === 'error' ? "alert-circle" : "document-text"}
                                                    size={14}
                                                    color={f.status === 'success' ? theme.colors.success : f.status === 'error' ? theme.colors.error : theme.colors.textSecondary}
                                                />
                                                <Text style={styles.chipText} numberOfLines={1}>{f.file.name}</Text>
                                                {f.status === 'uploading' ? (
                                                    <ActivityIndicator size="small" color={theme.colors.brandBlue} style={{ marginLeft: 4 }} />
                                                ) : f.status === 'pending' && (
                                                    <TouchableOpacity onPress={() => removeFile(doc.key, f.file.name)} hitSlop={8}>
                                                        <Ionicons name="close-circle" size={16} color={theme.colors.textSecondary} />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => step === 1 ? navigation.goBack() : setStep(1)} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Mortgage Loan Application</Text>
                    <Text style={styles.stepIndicator}>Step {step} of 2</Text>
                </View>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                {step === 1 ? renderStep1() : renderStep2()}
            </ScrollView>
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitBtn, isSubmitting && styles.disabledBtn]}
                    onPress={step === 1 ? handleCreateLead : handleFinalSubmission}
                    disabled={isSubmitting}
                    activeOpacity={0.8}
                >
                    {isSubmitting ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <ActivityIndicator color="#fff" />
                            <Text style={styles.submitBtnText}>{statusMsg || "Processing..."}</Text>
                        </View>
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={styles.submitBtnText}>{step === 1 ? "Next Step" : "Submit Application"}</Text>
                            <Ionicons name="arrow-forward" size={18} color="#fff" />
                        </View>
                    )}
                </TouchableOpacity>
            </View>
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
        flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingTop: Platform.OS === 'android' ? 40 : 16
    },
    backBtn: { padding: 8, marginRight: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    stepIndicator: { fontSize: 12, color: '#64748B', fontWeight: '500' },
    content: { padding: 16 },
    formContainer: { gap: 16 },
    card: {
        backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 16
    },
    cardHeader: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
    cardSubHeader: { fontSize: 12, color: '#64748B', marginBottom: 16, marginTop: -12 },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
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
    step2Container: { gap: 16 },
    successBanner: { flexDirection: 'row', gap: 12, backgroundColor: '#F0FDF4', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#BBF7D0' },
    successTitle: { fontWeight: 'bold', color: '#166534', fontSize: 16 },
    successSub: { fontSize: 13, color: '#15803D' },
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
    footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
    submitBtn: { backgroundColor: theme.colors.brandBlue, padding: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center', shadowColor: theme.colors.brandBlue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
    disabledBtn: { opacity: 0.7 }
});
