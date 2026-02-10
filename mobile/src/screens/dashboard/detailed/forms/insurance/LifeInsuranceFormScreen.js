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
    Platform,
    Modal,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { DashboardService } from '../../../../../services/dashboardService';
import theme from '../../../../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import DatePickerInput from '../../../../../components/common/DatePickerInput';
import GradientButton from '../../../../../components/common/GradientButton';

const MAX_FILE_SIZE_BYTES = 200 * 1024; // 200KB

const PLAN_TYPES = ["Term Insurance", "ULIP", "TULIP", "Child Plan", "Pension Plan", "Saving Plan"];
const PROFESSIONS = ["Salaried", "Self Employed"];
const INCOME_PROOFS = ["3 Years ITR", "Form 16"];

export default function LifeInsuranceFormScreen() {
    const navigation = useNavigation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [form, setForm] = useState({
        planType: "", proposerName: "", mobile: "", email: "", dob: "", education: "", profession: "",
        income: "", incomeProof: "", sumAssured: "", policyTerm: "", ppt: "",
        smokerStatus: "", drinkerStatus: "", existingDisease: "", investmentOption: "Investment Budget",
        investmentBudget: "", requiredMaturity: "", requiredPension: ""
    });

    // Errors State
    const [errors, setErrors] = useState({});

    // Document State
    const [incomeProofDoc, setIncomeProofDoc] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('idle');

    // Derived State
    const showTermFields = form.planType === "Term Insurance" || form.planType === "TULIP";
    const showInvestmentFields = ["ULIP", "Child Plan", "Pension Plan", "Saving Plan"].includes(form.planType);
    const showUploadField = INCOME_PROOFS.includes(form.incomeProof);

    const handleInputChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const validate = () => {
        const errs = {};
        const req = (f, msg) => { if (!String(form[f] || "").trim()) errs[f] = msg; };

        req("planType", "Select a plan type");
        req("proposerName", "Proposer Name is required");
        req("mobile", "Mobile is required");
        req("email", "Email is required");
        req("dob", "DOB is required");
        req("profession", "Select profession");
        req("income", "Annual income is required");
        req("policyTerm", "Policy term is required");
        req("ppt", "PPT is required");

        if (form.mobile && form.mobile.length !== 10) errs.mobile = "Must be 10 digits";

        if (showTermFields) {
            req("education", "Education is required");
            req("incomeProof", "Select income proof");
            req("sumAssured", "Sum assured is required");
            req("smokerStatus", "Required");
            req("drinkerStatus", "Required");
            req("existingDisease", "Required");

            if (showUploadField && !incomeProofDoc) {
                Alert.alert("Error", "Please upload Income Proof Document.");
                return false;
            }
        }

        if (showInvestmentFields) {
            if (form.investmentOption === "Investment Budget") {
                req("investmentBudget", "Budget is required");
            } else {
                if (form.planType === "Pension Plan") req("requiredPension", "Required pension is required");
                else req("requiredMaturity", "Required maturity is required");
            }
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true,
                multiple: false
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                if (file.size > MAX_FILE_SIZE_BYTES) {
                    Alert.alert("File Too Large", `File "${file.name}" exceeds 200KB limit.`);
                    return;
                }
                setIncomeProofDoc(file);
                setUploadStatus('idle');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async () => {
        if (!validate()) {
            Alert.alert("Error", "Please fill all required fields correctly.");
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Construct Payload
            const dynamicFormData = {
                planType: form.planType,
                proposerName: form.proposerName,
                dob: form.dob,
                profession: form.profession,
                income: form.income,
                policyTerm: form.policyTerm,
                ppt: form.ppt,
            };

            if (showTermFields) {
                dynamicFormData.education = form.education;
                dynamicFormData.incomeProof = form.incomeProof;
                dynamicFormData.sumAssured = form.sumAssured;
                dynamicFormData.smokerStatus = form.smokerStatus;
                dynamicFormData.drinkerStatus = form.drinkerStatus;
                dynamicFormData.existingDisease = form.existingDisease;
            }

            if (showInvestmentFields) {
                dynamicFormData.investmentOption = form.investmentOption;
                if (form.investmentOption === "Investment Budget") {
                    dynamicFormData.investmentBudget = form.investmentBudget;
                } else {
                    if (form.planType === "Pension Plan") {
                        dynamicFormData.requiredPension = form.requiredPension;
                    } else {
                        dynamicFormData.requiredMaturity = form.requiredMaturity;
                    }
                }
            }

            const payload = {
                department: "Insurance",
                product_type: "Life Insurance",
                sub_category: "Life Insurance",
                client: {
                    name: form.proposerName,
                    mobile: form.mobile,
                    email: form.email,
                },
                meta: { is_self_login: false },
                form_data: dynamicFormData
            };

            // 2. Create Lead
            const result = await DashboardService.createLead(payload);
            const leadId = result?.detail_lead_id;

            if (!leadId) throw new Error("Lead ID missing in response");

            // 3. Upload Document (if applicable)
            if (showTermFields && showUploadField && incomeProofDoc) {
                setUploadStatus('uploading');
                const formData = new FormData();
                formData.append("leadDbId", leadId);
                formData.append("metadata", JSON.stringify([{ key: "INCOME_PROOF", label: "Income Proof Document" }]));

                const fileObj = {
                    uri: incomeProofDoc.uri,
                    name: incomeProofDoc.name,
                    type: incomeProofDoc.mimeType || 'application/octet-stream'
                };
                formData.append("documents", fileObj);

                await DashboardService.uploadLeadDocument(leadId, formData);
                setUploadStatus('success');
            }

            Alert.alert("Success", "Life Insurance Application Submitted Successfully!", [
                { text: "OK", onPress: () => navigation.navigate("LeadManagement") }
            ]);

        } catch (err) {
            console.error("Submission error:", err);
            Alert.alert("Error", err.response?.data?.message || "Failed to submit application.");
            setUploadStatus('error');
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
                <Text style={styles.headerTitle}>Life Insurance Form</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Basic Info */}
                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Basic Details</Text>
                    <CustomPicker label="Plan Type" required value={form.planType} options={PLAN_TYPES} onSelect={v => handleInputChange("planType", v)} error={errors.planType} />

                    {form.planType ? (
                        <>
                            <InputGroup label="Proposer Name" required value={form.proposerName} onChange={v => handleInputChange("proposerName", v)} error={errors.proposerName} />
                            <InputGroup label="Mobile Number" required keyboardType="numeric" maxLength={10} value={form.mobile} onChange={v => handleInputChange("mobile", v)} error={errors.mobile} />
                            <InputGroup label="Email ID" required keyboardType="email-address" value={form.email} onChange={v => handleInputChange("email", v)} error={errors.email} />
                            <DatePickerInput label="Date of Birth" required value={form.dob} onChange={v => handleInputChange("dob", v)} maximumDate={new Date()} error={errors.dob} />

                            {showTermFields && (
                                <InputGroup label="Education" required value={form.education} onChange={v => handleInputChange("education", v)} error={errors.education} placeholder="Highest Qualification" />
                            )}

                            <CustomPicker label="Profession" required value={form.profession} options={PROFESSIONS} onSelect={v => handleInputChange("profession", v)} error={errors.profession} />
                            <InputGroup label="Annual Income" required keyboardType="numeric" value={form.income} onChange={v => handleInputChange("income", v)} error={errors.income} />
                        </>
                    ) : null}
                </View>

                {form.planType ? (
                    <>
                        <View style={styles.card}>
                            <Text style={styles.cardHeader}>Policy Details</Text>

                            {showTermFields && (
                                <>
                                    <CustomPicker label="Income Proof" required value={form.incomeProof} options={INCOME_PROOFS} onSelect={v => handleInputChange("incomeProof", v)} error={errors.incomeProof} />
                                    <InputGroup label="Sum Assured Amount" required keyboardType="numeric" value={form.sumAssured} onChange={v => handleInputChange("sumAssured", v)} error={errors.sumAssured} />
                                </>
                            )}

                            <InputGroup label="Policy Term (Years)" required keyboardType="numeric" value={form.policyTerm} onChange={v => handleInputChange("policyTerm", v)} error={errors.policyTerm} />
                            <InputGroup label="Premium Paying Term (PPT)" required keyboardType="numeric" value={form.ppt} onChange={v => handleInputChange("ppt", v)} error={errors.ppt} />

                            {showTermFields && (
                                <>
                                    <InputGroup label="Smoker / Non-Smoker" required value={form.smokerStatus} onChange={v => handleInputChange("smokerStatus", v)} error={errors.smokerStatus} placeholder="e.g. Non-Smoker" />
                                    <InputGroup label="Drinker / Non-Drinker" required value={form.drinkerStatus} onChange={v => handleInputChange("drinkerStatus", v)} error={errors.drinkerStatus} placeholder="e.g. Non-Drinker" />
                                    <InputGroup label="Any Existing Disease" required value={form.existingDisease} onChange={v => handleInputChange("existingDisease", v)} error={errors.existingDisease} placeholder="Enter disease or 'None'" />
                                </>
                            )}
                        </View>

                        {showInvestmentFields && (
                            <View style={styles.card}>
                                <Text style={styles.cardHeader}>Investment Details</Text>
                                <CustomPicker
                                    label="Select Investment Option"
                                    required
                                    value={form.investmentOption}
                                    options={["Investment Budget", form.planType === "Pension Plan" ? "Required Pension" : "Required Maturity"]}
                                    onSelect={v => handleInputChange("investmentOption", v)}
                                    error={errors.investmentOption}
                                />

                                {form.investmentOption === "Investment Budget" ? (
                                    <InputGroup label="Investment Budget (Yearly)" required keyboardType="numeric" value={form.investmentBudget} onChange={v => handleInputChange("investmentBudget", v)} error={errors.investmentBudget} />
                                ) : (
                                    <>
                                        {form.planType === "Pension Plan" ? (
                                            <InputGroup label="Required Pension (Monthly)" required keyboardType="numeric" value={form.requiredPension} onChange={v => handleInputChange("requiredPension", v)} error={errors.requiredPension} />
                                        ) : (
                                            <InputGroup label="Required Maturity Amount" required keyboardType="numeric" value={form.requiredMaturity} onChange={v => handleInputChange("requiredMaturity", v)} error={errors.requiredMaturity} />
                                        )}
                                    </>
                                )}
                            </View>
                        )}

                        {showTermFields && showUploadField && (
                            <View style={styles.card}>
                                <Text style={styles.cardHeader}>Documents</Text>
                                <Text style={styles.cardSubHeader}>Income Proof Document (Max 200KB)</Text>
                                {!incomeProofDoc ? (
                                    <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
                                        <Ionicons name="cloud-upload-outline" size={24} color={theme.colors.brandBlue} />
                                        <Text style={styles.uploadText}>Upload {form.incomeProof}</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.fileItem}>
                                        <Ionicons name="document-text" size={20} color={theme.colors.textSecondary} />
                                        <Text style={styles.fileName} numberOfLines={1}>{incomeProofDoc.name}</Text>
                                        <TouchableOpacity onPress={() => setIncomeProofDoc(null)}>
                                            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}
                    </>
                ) : null}

            </ScrollView>

            <View style={styles.footer}>
                <GradientButton
                    onPress={handleSubmit}
                    title={isSubmitting ? (uploadStatus === 'uploading' ? "Uploading Doc..." : "Submitting...") : "Submit Application"}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={{ borderRadius: 10, paddingVertical: 16 }}
                />
            </View>
        </SafeAreaView>
    );
}

// --- Reusable Components (Corrected with Native Modal) ---

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

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingTop: Platform.OS === 'android' ? 40 : 16
    },
    backBtn: { padding: 8, marginRight: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },

    content: { padding: 16 },
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
    cardSubHeader: { fontSize: 12, color: '#64748B', marginBottom: 12, marginTop: -8 },

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

    uploadBox: { borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed', borderRadius: 8, height: 50, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, backgroundColor: '#F8FAFC' },
    uploadText: { color: theme.colors.brandBlue, fontWeight: '600', fontSize: 14 },
    fileItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, backgroundColor: '#F1F5F9', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
    fileName: { flex: 1, marginHorizontal: 8, color: '#334155', fontSize: 13 },

    footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
});
