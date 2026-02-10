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
import GradientButton from '../../../../../components/common/GradientButton';

const MAX_FILE_SIZE_BYTES = 200 * 1024; // 200KB

const STUDENT_DOC_REGISTRY = {
    "Aadhar Card": { key: "AADHAAR", label: "Aadhar Card", multiple: false },
    "PAN Card": { key: "PAN", label: "PAN Card", multiple: false },
    "Passport / Driving License": { key: "PASSPORT_DL", label: "Passport / Driving License", multiple: false },
    "Resident Proof": { key: "RESIDENT_PROOF", label: "Resident Proof", multiple: false },
    "Current Address Proof": { key: "CURRENT_ADDR", label: "Current Address Proof", multiple: false },
    "Academic Documents": { key: "ACADEMIC", label: "Academic Documents", multiple: true },
    "Offer Letter": { key: "OFFER_LETTER", label: "Offer Letter", multiple: false },
    "Fee Structure": { key: "FEE_STRUCTURE", label: "Fee Structure", multiple: false },
    "Visa / I20 (USA)": { key: "VISA_I20", label: "Visa / I20 (USA)", multiple: false },
    "Entrance Exam Score Card": { key: "SCORE_CARD", label: "Entrance Exam Score Card", multiple: false },
    "Existing Loan Statement": { key: "EXISTING_LOAN", label: "Existing Loan Statement", multiple: true },
};

const CO_APPLICANT_DOC_MAP = {
    "Salaried Person": ["Aadhar Card", "PAN Card", "Driving License", "Passport", "Permanent Address Proof", "Current Address Proof", "3 Months Salary Slip", "6 Months Bank Statement", "Form 16", "2 Years ITR"],
    "Self Employed": ["Aadhar Card", "PAN Card", "Driving License", "Passport", "Permanent Address Proof", "Current Address Proof", "6 Months Bank Statement", "GST Certificate", "Udyog Aadhar", "3 Years ITR", "Shop Act"],
    "Retired": ["Aadhar Card", "PAN Card", "Driving License", "Passport", "Permanent Address Proof", "Current Address Proof", "6 Months Bank Statement", "2 Years ITR", "Pension Slips/Certificate"]
};

// Registry for Co-Applicant Docs to map labels to keys
const CO_DOC_REGISTRY = {
    "Aadhar Card": { key: "CO_AADHAAR", label: "Co-App Aadhar Card", multiple: false },
    "PAN Card": { key: "CO_PAN", label: "Co-App PAN Card", multiple: false },
    "Driving License": { key: "CO_DL", label: "Co-App Driving License", multiple: false },
    "Passport": { key: "CO_PASSPORT", label: "Co-App Passport", multiple: false },
    "Permanent Address Proof": { key: "CO_PERM_ADDR", label: "Co-App Perm. Address Proof", multiple: false },
    "Current Address Proof": { key: "CO_CURR_ADDR", label: "Co-App Curr. Address Proof", multiple: false },
    "3 Months Salary Slip": { key: "CO_SALARY", label: "Co-App 3 Months Salary Slip", multiple: true },
    "6 Months Bank Statement": { key: "CO_BANK_STMT", label: "Co-App 6 Months Bank Statement", multiple: true },
    "Form 16": { key: "CO_FORM16", label: "Co-App Form 16", multiple: true },
    "2 Years ITR": { key: "CO_ITR", label: "Co-App 2 Years ITR", multiple: true },
    "GST Certificate": { key: "CO_GST", label: "Co-App GST Certificate", multiple: false },
    "Udyog Aadhar": { key: "CO_UDYAM", label: "Co-App Udyog Aadhar", multiple: false },
    "3 Years ITR": { key: "CO_ITR_3YRS", label: "Co-App 3 Years ITR", multiple: true },
    "Shop Act": { key: "CO_SHOP_ACT", label: "Co-App Shop Act", multiple: false },
    "Pension Slips/Certificate": { key: "CO_PENSION", label: "Co-App Pension Slips/Certificate", multiple: true },
};

const CustomPicker = ({ label, value, options, onSelect, error, required }) => {
    const [modalVisible, setModalVisible] = useState(false);
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

export default function EducationLoanFormScreen() {
    const navigation = useNavigation();
    const [step, setStep] = useState(1);
    const [leadId, setLeadId] = useState(null);
    const [form, setForm] = useState({
        clientName: "", phone: "", email: "", dob: "", location: "",
        loanAmount: "", courseName: "", institutionName: "", countryName: "",
        hasOtherLoan: "", otherLoanAmount: "", coApplicantEmploymentType: ""
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileQueue, setFileQueue] = useState([]);
    const [statusMsg, setStatusMsg] = useState("");

    const requiredDocsList = useMemo(() => {
        let docs = [];
        // Student Docs
        const studentBaseDocs = ["Aadhar Card", "PAN Card", "Passport / Driving License", "Resident Proof", "Current Address Proof", "Academic Documents", "Offer Letter", "Fee Structure", "Visa / I20 (USA)", "Entrance Exam Score Card"];
        if (form.hasOtherLoan === "Yes") studentBaseDocs.push("Existing Loan Statement");

        docs.push(...studentBaseDocs.map(label => ({ ...STUDENT_DOC_REGISTRY[label], section: "Student" })).filter(d => d.key));

        // Co-Applicant Docs
        if (form.coApplicantEmploymentType && CO_APPLICANT_DOC_MAP[form.coApplicantEmploymentType]) {
            const coDocs = CO_APPLICANT_DOC_MAP[form.coApplicantEmploymentType];
            docs.push(...coDocs.map(label => ({ ...CO_DOC_REGISTRY[label], section: "Co-Applicant" })).filter(d => d.key));
        }

        return docs;
    }, [form.hasOtherLoan, form.coApplicantEmploymentType]);

    const handleInputChange = (field, value) => {
        setForm(prev => ({
            ...prev, [field]: value,
            ...(field === "hasOtherLoan" && value === "No" ? { otherLoanAmount: "" } : {})
        }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const validateStep1 = () => {
        const errs = {};
        const req = (f, msg) => { if (!form[f]?.trim()) errs[f] = msg; };

        req("clientName", "Student Name is required");
        req("location", "Location is required");
        req("dob", "Date of Birth is required");
        req("loanAmount", "Loan Amount is required");
        req("courseName", "Course Name is required");
        req("institutionName", "Institution Name is required");
        req("countryName", "Country Name is required");
        req("coApplicantEmploymentType", "Select employment type");

        if (!form.phone || form.phone.length !== 10) errs.phone = "Phone number must be exactly 10 digits";
        if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email format";
        if (!form.hasOtherLoan) errs.hasOtherLoan = "Select an option";
        if (form.hasOtherLoan === "Yes" && !form.otherLoanAmount) errs.otherLoanAmount = "Existing loan amount is required";

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
                product_type: "Education Loan",
                sub_category: "Education Loan",
                client: {
                    name: form.clientName,
                    mobile: form.phone,
                    email: form.email,
                },
                meta: { is_self_login: false },
                form_data: {
                    dob: form.dob,
                    location: form.location,
                    loanAmount: form.loanAmount,
                    courseName: form.courseName,
                    institutionName: form.institutionName,
                    countryName: form.countryName,
                    hasOtherLoan: form.hasOtherLoan,
                    otherLoanAmount: form.otherLoanAmount || "0",
                    coApplicantEmploymentType: form.coApplicantEmploymentType
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
                <Text style={styles.cardHeader}>Student Details</Text>
                <InputGroup label="Student Name" required value={form.clientName} onChange={v => handleInputChange("clientName", v)} error={errors.clientName} placeholder="Enter full name" />
                <InputGroup label="Phone Number" required keyboardType="numeric" maxLength={10} value={form.phone} onChange={v => handleInputChange("phone", v)} error={errors.phone} placeholder="10-digit number" />
                <InputGroup label="Email ID" required keyboardType="email-address" value={form.email} onChange={v => handleInputChange("email", v)} error={errors.email} placeholder="Enter email address" />
                <DatePickerInput label="Date of Birth" required value={form.dob} onChange={v => handleInputChange("dob", v)} maximumDate={new Date()} error={errors.dob} />
                <InputGroup label="Location" required value={form.location} onChange={v => handleInputChange("location", v)} error={errors.location} placeholder="Enter city" />
            </View>

            <View style={styles.card}>
                <Text style={styles.cardHeader}>Course / Loan Details</Text>
                <InputGroup label="Loan Amount" required keyboardType="numeric" value={form.loanAmount} onChange={v => handleInputChange("loanAmount", v)} error={errors.loanAmount} placeholder="Enter amount" />
                <InputGroup label="Course Name" required value={form.courseName} onChange={v => handleInputChange("courseName", v)} error={errors.courseName} placeholder="e.g. MS in CS" />
                <InputGroup label="Institution Name" required value={form.institutionName} onChange={v => handleInputChange("institutionName", v)} error={errors.institutionName} placeholder="University name" />
                <InputGroup label="Country Name" required value={form.countryName} onChange={v => handleInputChange("countryName", v)} error={errors.countryName} placeholder="Study destination" />
            </View>

            <View style={styles.card}>
                <Text style={styles.cardHeader}>Co-Applicant & Other</Text>
                <CustomPicker label="Co-Applicant Employment Type" required value={form.coApplicantEmploymentType} options={["Salaried Person", "Self Employed", "Retired"]} onSelect={v => handleInputChange("coApplicantEmploymentType", v)} error={errors.coApplicantEmploymentType} />
                <CustomPicker label="Any Other Loan Obligations?" required value={form.hasOtherLoan} options={["Yes", "No"]} onSelect={v => handleInputChange("hasOtherLoan", v)} error={errors.hasOtherLoan} />
                {form.hasOtherLoan === "Yes" && (
                    <InputGroup label="Existing Loan Amount" required keyboardType="numeric" value={form.otherLoanAmount} onChange={v => handleInputChange("otherLoanAmount", v)} error={errors.otherLoanAmount} placeholder="Enter amount" />
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
                    {requiredDocsList.map((doc, index) => {
                        const files = fileQueue.filter(f => f.docKey === doc.key);
                        const filled = files.length > 0;
                        return (
                            <View key={doc.key + index} style={[styles.docItem, filled && styles.docItemFilled]}>
                                <View style={styles.docItemHeader}>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <Text style={styles.docTitle}>{doc.label}</Text>
                                            {filled && <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />}
                                        </View>
                                        <Text style={styles.docType}>
                                            {doc.section} • {doc.multiple ? "Multiple files" : "Single file"}
                                        </Text>
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
                    <Text style={styles.headerTitle}>Education Loan Application</Text>
                    <Text style={styles.stepIndicator}>Step {step} of 2</Text>
                </View>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                {step === 1 ? renderStep1() : renderStep2()}
            </ScrollView>
            <View style={styles.footer}>
                <GradientButton
                    onPress={step === 1 ? handleCreateLead : handleFinalSubmission}
                    title={step === 1 ? "Next Step" : "Submit Application"}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    icon={<Ionicons name="arrow-forward" size={18} color="#fff" />}
                    style={{ borderRadius: 10, paddingVertical: 16 }}
                />
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
