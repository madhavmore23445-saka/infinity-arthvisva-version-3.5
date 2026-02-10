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

const POLICY_TYPES = ["Fresh", "Port", "Renewal"];
const PLAN_TYPES = ["Individual", "Family Floater"];
const TENURES = ["1 Year", "2 Years", "3 Years", "4 Years", "5 Years"];

export default function HealthInsuranceFormScreen() {
    const navigation = useNavigation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [form, setForm] = useState({
        policyType: "", planType: "", proposer: "", mobile: "", email: "", city: "", pin: "",
        PSA: "", policyTenure: "", dob: "", disease: "",
        FirstAdultDob: "", SecondAdultDob: "", child1Dob: "", child2Dob: ""
    });

    // Errors State
    const [errors, setErrors] = useState({});

    // Document State
    const [prevPolicyDocs, setPrevPolicyDocs] = useState([]); // Array of file objects
    const [uploadStatus, setUploadStatus] = useState('idle');

    // Derived Logic
    const isPortOrRenewal = form.policyType === "Port" || form.policyType === "Renewal";
    const isIndividual = form.planType === "Individual";
    const isFamily = form.planType === "Family Floater";

    const handleInputChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const validate = () => {
        const errs = {};
        const req = (f, msg) => { if (!String(form[f] || "").trim()) errs[f] = msg; };

        req("policyType", "Select policy type");
        req("planType", "Select plan type");
        req("proposer", "Proposer Name is required");
        req("mobile", "Mobile is required");
        req("city", "City is required");

        if (form.pin && form.pin.length !== 6) errs.pin = "Pin must be 6 digits";
        else if (!form.pin) errs.pin = "Pin is required";

        if (form.mobile && form.mobile.length !== 10) errs.mobile = "Must be 10 digits";

        req("PSA", "Sum Assured is required");
        req("policyTenure", "Select tenure");
        req("disease", "Enter disease or 'None'");

        if (isIndividual) {
            req("dob", "DOB is required");
        }

        if (isFamily) {
            req("FirstAdultDob", "DOB required");
            req("SecondAdultDob", "DOB required");
            // Children DOBs might be optional depending on family size, but let's make them optional or required based on basic assumption. 
            // Web app requires them if fields are present. Let's make child1 required to be safe, or check web logic. 
            // Web logic: req("child1Dob", "DOB required"); req("child2Dob", "DOB required");
            req("child1Dob", "DOB required");
            req("child2Dob", "DOB required");
        }

        if (isPortOrRenewal && prevPolicyDocs.length === 0) {
            Alert.alert("Error", "Please upload Previous Policy Document.");
            return false;
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const pickDocument = async () => {
        try {
            if (prevPolicyDocs.length >= 8) {
                Alert.alert("Limit Reached", "Max 8 files allowed.");
                return;
            }

            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true,
                multiple: true // Allow multiple if possible, or single sequential
            });

            if (!result.canceled && result.assets) {
                const newFiles = result.assets.filter(file => {
                    if (file.size > MAX_FILE_SIZE_BYTES) {
                        Alert.alert("File Skipped", `File "${file.name}" exceeds 200KB.`);
                        return false;
                    }
                    return true;
                });

                setPrevPolicyDocs(prev => [...prev, ...newFiles]);
                setUploadStatus('idle');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const removeFile = (index) => {
        setPrevPolicyDocs(prev => prev.filter((_, i) => i !== index));
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
                product_type: "Health Insurance",
                sub_category: "Health Insurance",
                client: {
                    name: form.proposer,
                    mobile: form.mobile,
                    email: form.email || "",
                },
                meta: { is_self_login: false },
                form_data: {
                    policyType: form.policyType,
                    planType: form.planType,
                    city: form.city,
                    pin: form.pin,
                    psa: form.PSA,
                    policyTenure: form.policyTenure,
                    dob: form.dob,
                    disease: form.disease,
                    // Family details if applicable
                    FirstAdultDob: form.FirstAdultDob,
                    SecondAdultDob: form.SecondAdultDob,
                    child1Dob: form.child1Dob,
                    child2Dob: form.child2Dob
                }
            };

            const result = await DashboardService.createLead(payload);
            const leadId = result?.detail_lead_id;

            if (!leadId) throw new Error("Lead ID missing");

            // Upload Documents
            if (isPortOrRenewal && prevPolicyDocs.length > 0) {
                setUploadStatus('uploading');

                // Upload files sequentially or in parallel. 
                // The service might expect one call or multiple. Web app 'uploadLeadDocument' usually takes one 'documents' field.
                // If the backend accepts multiple files in one request, we use 'documents' as array? 
                // Looking at web service: formData.append("documents", file). It seems to handle one file per key, or we need to loop.
                // Assuming loop or multiple appends.

                // Let's loop for safety as common pattern
                for (const file of prevPolicyDocs) {
                    const formData = new FormData();
                    formData.append("leadDbId", leadId);
                    formData.append("metadata", JSON.stringify([{ key: "PREV_POLICY", label: "Previous Policy Document" }]));

                    const fileObj = {
                        uri: file.uri,
                        name: file.name,
                        type: file.mimeType || 'application/octet-stream'
                    };
                    formData.append("documents", fileObj);

                    await DashboardService.uploadLeadDocument(leadId, formData);
                }
                setUploadStatus('success');
            }

            Alert.alert("Success", "Health Insurance Application Submitted Successfully!", [
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
                <Text style={styles.headerTitle}>Health Insurance Form</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Policy Info */}
                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Policy Details</Text>
                    <CustomPicker label="Policy Type" required value={form.policyType} options={POLICY_TYPES} onSelect={v => handleInputChange("policyType", v)} error={errors.policyType} />
                    <CustomPicker label="Plan Type" required value={form.planType} options={PLAN_TYPES} onSelect={v => handleInputChange("planType", v)} error={errors.planType} />

                    <InputGroup label="Proposer Name" required value={form.proposer} onChange={v => handleInputChange("proposer", v)} error={errors.proposer} />
                    <InputGroup label="Mobile Number" required keyboardType="numeric" maxLength={10} value={form.mobile} onChange={v => handleInputChange("mobile", v)} error={errors.mobile} />
                    <InputGroup label="Email ID" keyboardType="email-address" value={form.email} onChange={v => handleInputChange("email", v)} />
                </View>

                {(isIndividual || isFamily) && (
                    <View style={styles.card}>
                        <Text style={styles.cardHeader}>Coverage Details</Text>
                        <InputGroup label="City" required value={form.city} onChange={v => handleInputChange("city", v)} error={errors.city} />
                        <InputGroup label="Pin Code" required keyboardType="numeric" maxLength={6} value={form.pin} onChange={v => handleInputChange("pin", v)} error={errors.pin} />
                        <InputGroup label="Preferred Sum Assured (PSA)" required keyboardType="numeric" value={form.PSA} onChange={v => handleInputChange("PSA", v)} error={errors.PSA} />
                        <CustomPicker label="Policy Tenure" required value={form.policyTenure} options={TENURES} onSelect={v => handleInputChange("policyTenure", v)} error={errors.policyTenure} />

                        {isIndividual && (
                            <DatePickerInput label="Date of Birth" required value={form.dob} onChange={v => handleInputChange("dob", v)} maximumDate={new Date()} error={errors.dob} />
                        )}

                        {isFamily && (
                            <>
                                <DatePickerInput label="DOB of First Adult" required value={form.FirstAdultDob} onChange={v => handleInputChange("FirstAdultDob", v)} maximumDate={new Date()} error={errors.FirstAdultDob} />
                                <DatePickerInput label="DOB of Second Adult" required value={form.SecondAdultDob} onChange={v => handleInputChange("SecondAdultDob", v)} maximumDate={new Date()} error={errors.SecondAdultDob} />
                                <DatePickerInput label="DOB of 1st Child" required value={form.child1Dob} onChange={v => handleInputChange("child1Dob", v)} maximumDate={new Date()} error={errors.child1Dob} />
                                <DatePickerInput label="DOB of 2nd Child" required value={form.child2Dob} onChange={v => handleInputChange("child2Dob", v)} maximumDate={new Date()} error={errors.child2Dob} />
                            </>
                        )}

                        <InputGroup label="Pre-Existing Disease" required value={form.disease} onChange={v => handleInputChange("disease", v)} error={errors.disease} placeholder="Enter details or 'None'" />
                    </View>
                )}

                {isPortOrRenewal && (
                    <View style={styles.card}>
                        <Text style={styles.cardHeader}>Documents (Required)</Text>
                        <Text style={styles.cardSubHeader}>Previous Policy Document (Max 200KB)</Text>

                        <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
                            <Ionicons name="cloud-upload-outline" size={24} color={theme.colors.brandBlue} />
                            <Text style={styles.uploadText}>Upload Document</Text>
                        </TouchableOpacity>

                        {prevPolicyDocs.map((file, index) => (
                            <View key={index} style={styles.fileItem}>
                                <Ionicons name="document-text" size={20} color={theme.colors.textSecondary} />
                                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                                <TouchableOpacity onPress={() => removeFile(index)}>
                                    <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

            </ScrollView>

            <View style={styles.footer}>
                <GradientButton
                    onPress={handleSubmit}
                    title={isSubmitting ? (uploadStatus === 'uploading' ? "Uploading Docs..." : "Submitting...") : "Submit Application"}
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
    fileItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, backgroundColor: '#F1F5F9', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8 },
    fileName: { flex: 1, marginHorizontal: 8, color: '#334155', fontSize: 13 },

    footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
});
