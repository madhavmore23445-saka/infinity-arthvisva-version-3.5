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
import * as DocumentPicker from 'expo-document-picker';
import { DashboardService } from '../../../../../services/dashboardService';
import theme from '../../../../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import GradientButton from '../../../../../components/common/GradientButton';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export default function CorporateInsuranceFormScreen() {
    const navigation = useNavigation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('idle');

    // Form State
    const [form, setForm] = useState({
        insuranceType: "", // GMC, GPA, WC
        insuredName: "",
        insuredAddress: "",
        businessNature: "",
        pincode: "",
        riskLocation: "",
        contactName: "",
        contactMobile: "",
        contactEmail: "",
        policyType: "", // fresh, renewal
        coverType: "individual", // individual, floater
        maternityCover: false,
        preExistingDisease: false,
        roomRentLimit: "",
        sumInsured: "",
        claimLastYear: "", // yes, no
        
        // Medical Extension
        medicalExtension: "no",
        medicalLimit: "",
        
        // WC Rows (simplified for mobile - maybe just total counts or a separate modal for detailed entry if needed, but keeping it simple first)
        // For now, we will just capture basic details or maybe skip complex table rows if not strictly critical for lead creation MVP on mobile
        // matching web:
        wcRows: [
            { category: "ENGINEER", count: "4", months: "12", monthlyWage: "40800" },
            { category: "SUPERVISOR", count: "2", months: "12", monthlyWage: "21000" },
            { category: "SKILL WORKER", count: "19", months: "12", monthlyWage: "18000" },
            { category: "UNSKILL WORKER", count: "50", months: "12", monthlyWage: "15500" },
        ]
    });

    const [errors, setErrors] = useState({});
    
    // Files State
    const [files, setFiles] = useState({});

    const handleInputChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const handleFilePick = async (field) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
                copyToCacheDirectory: true,
                multiple: false
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                if (file.size > MAX_FILE_SIZE_BYTES) {
                    Alert.alert("File Too Large", `File "${file.name}" exceeds 5MB limit.`);
                    return;
                }
                setFiles(prev => ({ ...prev, [field]: file }));
                if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const removeFile = (field) => {
        setFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[field];
            return newFiles;
        });
    };

    const validate = () => {
        const errs = {};
        const req = (f, msg) => { if (!String(form[f] || "").trim()) errs[f] = msg; };

        req("insuranceType", "Select Product Type");

        if (form.insuranceType) {
            req("insuredName", "Name is required");
            req("contactName", "Contact Name is required");
            req("contactMobile", "Mobile is required");
            req("contactEmail", "Email is required");
            if (form.contactMobile && form.contactMobile.length !== 10) errs.contactMobile = "10 digit number required";
            if (!files.gstCertificate) errs.gstCertificate = "GST Certificate required";
        }

        if (form.insuranceType === "WC" || form.insuranceType === "GPA") {
             req("pincode", "Pincode is required");
             if (form.pincode && form.pincode.length !== 6) errs.pincode = "6 digit Pincode required";
        }

        if (form.insuranceType === "WC") {
            req("riskLocation", "Risk Location is required");
            if (form.medicalExtension === "yes") req("medicalLimit", "Medical Limit required");
        }

        if (form.insuranceType === "GMC" || form.insuranceType === "GPA") {
            req("policyType", "Select Policy Type");
            if (form.insuranceType === "GMC") req("sumInsured", "Sum Insured required");
            
            if (form.policyType === "renewal") {
                if (!files.renewalCopy) errs.renewalCopy = "Previous Policy Copy required";
                if (form.claimLastYear === "yes" && !files.claimedFile) errs.claimedFile = "Claim Report required";
            }
            
            if (form.insuranceType === "GMC" && !files.gmcExcel) errs.gmcExcel = "Excel Data required";
            if (form.insuranceType === "GPA" && !files.gpaExcel) errs.gpaExcel = "Excel Data required";
        }

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
                product_type: "Corporate Insurance",
                sub_category: "Corporate Insurance",
                client: {
                    name: form.insuredName,
                    mobile: form.contactMobile || "",
                    email: form.contactEmail || "",
                },
                meta: {
                    is_self_login: false,
                },
                form_data: {
                    insuranceType: form.insuranceType,
                    insuredAddress: form.insuredAddress,
                    businessNature: form.businessNature,
                    pincode: form.pincode,
                    riskLocation: form.riskLocation,
                    contactName: form.contactName,
                    policyType: form.policyType,
                    sumInsured: form.sumInsured
                }
            };

            const result = await DashboardService.createLead(payload);
            const leadId = result?.detail_lead_id;

            if (!leadId) throw new Error("Lead ID missing in response");

            // Upload Documents
            const fileKeys = Object.keys(files);
            if (fileKeys.length > 0) {
                setUploadStatus('uploading');
                for (const key of fileKeys) {
                    const file = files[key];
                    const formData = new FormData();
                    formData.append("leadDbId", leadId);
                    
                    let label = "Document";
                    if (key === "gstCertificate") label = "GST Certificate";
                    else if (key === "gmcExcel") label = "GMC Employee Data";
                    else if (key === "gpaExcel") label = "GPA Employee Data";
                    else if (key === "renewalCopy") label = "Previous Policy";
                    else if (key === "claimedFile") label = "Claim Report";

                    formData.append("metadata", JSON.stringify([{ key: key.toUpperCase(), label: label }]));

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

            Alert.alert("Success", "Corporate Insurance Application Submitted!", [
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
                <Text style={styles.headerTitle}>Corporate Insurance</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                
                {/* Product Type Selection */}
                <View style={styles.card}>
                    <CustomPicker 
                        label="Product Type"
                        required
                        value={form.insuranceType}
                        options={["GMC", "GPA", "WC"]}
                        onSelect={v => {
                            setForm(prev => ({ ...prev, insuranceType: v }));
                            setFiles({}); // Clear files on type change to avoid confusion
                            setErrors({});
                        }}
                        error={errors.insuranceType}
                    />
                </View>

                {form.insuranceType ? (
                    <>
                        <View style={styles.card}>
                            <Text style={styles.cardHeader}>Organisation / Insured Details</Text>
                            <InputGroup label={form.insuranceType === "GPA" ? "Name Of Organisation" : "Full Name of Insured"} required value={form.insuredName} onChange={v => handleInputChange("insuredName", v)} error={errors.insuredName} />
                            <InputGroup label="Nature of Business" value={form.businessNature} onChange={v => handleInputChange("businessNature", v)} />
                            <InputGroup label="Address" value={form.insuredAddress} onChange={v => handleInputChange("insuredAddress", v)} />
                            
                            {(form.insuranceType === "GPA" || form.insuranceType === "WC") && (
                                <InputGroup label="Pin Code" required value={form.pincode} onChange={v => handleInputChange("pincode", v)} error={errors.pincode} keyboardType="numeric" maxLength={6} />
                            )}

                            {form.insuranceType === "WC" && (
                                <InputGroup label="Risk Location" required value={form.riskLocation} onChange={v => handleInputChange("riskLocation", v)} error={errors.riskLocation} />
                            )}
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.cardHeader}>Contact Person Details</Text>
                            <InputGroup label="Contact Person Name" required value={form.contactName} onChange={v => handleInputChange("contactName", v)} error={errors.contactName} />
                            <InputGroup label="Mobile Number" required value={form.contactMobile} onChange={v => handleInputChange("contactMobile", v)} error={errors.contactMobile} keyboardType="numeric" maxLength={10} />
                            <InputGroup label="Email ID" required value={form.contactEmail} onChange={v => handleInputChange("contactEmail", v)} error={errors.contactEmail} keyboardType="email-address" />
                        </View>

                        {/* WC Specific - Medical Extension */}
                        {form.insuranceType === "WC" && (
                            <View style={styles.card}>
                                <Text style={styles.cardHeader}>Medical Extension</Text>
                                <CustomPicker 
                                    label="Medical Extension Required?"
                                    value={form.medicalExtension}
                                    options={["yes", "no"]}
                                    onSelect={v => handleInputChange("medicalExtension", v)}
                                />
                                {form.medicalExtension === "yes" && (
                                    <InputGroup label="Limit (Per Person)" required value={form.medicalLimit} onChange={v => handleInputChange("medicalLimit", v)} error={errors.medicalLimit} keyboardType="numeric" />
                                )}
                            </View>
                        )}

                        {/* GMC/GPA Specific - Policy Config */}
                        {(form.insuranceType === "GMC" || form.insuranceType === "GPA") && (
                            <View style={styles.card}>
                                <Text style={styles.cardHeader}>Policy Configuration</Text>
                                <CustomPicker 
                                    label="Type of Policy"
                                    required
                                    value={form.policyType}
                                    options={["fresh", "renewal"]}
                                    onSelect={v => handleInputChange("policyType", v)}
                                    error={errors.policyType}
                                />
                                
                                {form.policyType === "renewal" && (
                                    <CustomPicker 
                                        label="Any claim taken last year?"
                                        value={form.claimLastYear}
                                        options={["yes", "no"]}
                                        onSelect={v => handleInputChange("claimLastYear", v)}
                                    />
                                )}

                                {form.insuranceType === "GMC" && (
                                    <>
                                        <InputGroup label="Sum Insured Amount" required value={form.sumInsured} onChange={v => handleInputChange("sumInsured", v)} error={errors.sumInsured} keyboardType="numeric" />
                                        <InputGroup label="Room Rent Limit" value={form.roomRentLimit} onChange={v => handleInputChange("roomRentLimit", v)} />
                                        
                                        <Text style={styles.label}>Cover Required</Text>
                                        <View style={styles.checkboxContainer}>
                                             {/* Simplified Checkboxes for mobile */}
                                             <TouchableOpacity style={styles.checkboxRow} onPress={() => handleInputChange("coverType", "individual")}>
                                                 <Ionicons name={form.coverType === "individual" ? "radio-button-on" : "radio-button-off"} size={20} color={theme.colors.brandTeal} />
                                                 <Text style={styles.checkboxText}>Individual</Text>
                                             </TouchableOpacity>
                                             <TouchableOpacity style={styles.checkboxRow} onPress={() => handleInputChange("coverType", "floater")}>
                                                 <Ionicons name={form.coverType === "floater" ? "radio-button-on" : "radio-button-off"} size={20} color={theme.colors.brandTeal} />
                                                 <Text style={styles.checkboxText}>Floater</Text>
                                             </TouchableOpacity>
                                        </View>
                                        <View style={styles.checkboxContainer}>
                                             <TouchableOpacity style={styles.checkboxRow} onPress={() => handleInputChange("maternityCover", !form.maternityCover)}>
                                                 <Ionicons name={form.maternityCover ? "checkbox" : "square-outline"} size={20} color={theme.colors.brandTeal} />
                                                 <Text style={styles.checkboxText}>Maternity</Text>
                                             </TouchableOpacity>
                                             <TouchableOpacity style={styles.checkboxRow} onPress={() => handleInputChange("preExistingDisease", !form.preExistingDisease)}>
                                                 <Ionicons name={form.preExistingDisease ? "checkbox" : "square-outline"} size={20} color={theme.colors.brandTeal} />
                                                 <Text style={styles.checkboxText}>Pre-Existing</Text>
                                             </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                            </View>
                        )}

                        {/* Documents */}
                        <View style={styles.card}>
                            <Text style={styles.cardHeader}>Required Documents</Text>
                            
                            <FileUploader 
                                label={form.insuranceType === "GMC" ? "GMC Employee Excel" : (form.insuranceType === "GPA" ? "GPA Employee Excel" : "GST Certificate")} 
                                file={form.insuranceType === "GMC" ? files.gmcExcel : (form.insuranceType === "GPA" ? files.gpaExcel : files.gstCertificate)} 
                                onPick={() => handleFilePick(form.insuranceType === "GMC" ? "gmcExcel" : (form.insuranceType === "GPA" ? "gpaExcel" : "gstCertificate"))}
                                onRemove={() => removeFile(form.insuranceType === "GMC" ? "gmcExcel" : (form.insuranceType === "GPA" ? "gpaExcel" : "gstCertificate"))}
                                error={errors[form.insuranceType === "GMC" ? "gmcExcel" : (form.insuranceType === "GPA" ? "gpaExcel" : "gstCertificate")]}
                                required
                            />

                            {(form.insuranceType === "GMC" || form.insuranceType === "GPA") && (
                                <FileUploader 
                                    label="GST Certificate" 
                                    file={files.gstCertificate} 
                                    onPick={() => handleFilePick("gstCertificate")}
                                    onRemove={() => removeFile("gstCertificate")}
                                    error={errors.gstCertificate}
                                    required
                                />
                            )}

                            {form.policyType === "renewal" && (
                                <FileUploader 
                                    label="Previous Policy Copy" 
                                    file={files.renewalCopy} 
                                    onPick={() => handleFilePick("renewalCopy")}
                                    onRemove={() => removeFile("renewalCopy")}
                                    error={errors.renewalCopy}
                                    required
                                />
                            )}

                            {form.policyType === "renewal" && form.claimLastYear === "yes" && (
                                <FileUploader 
                                    label="Claim History Report" 
                                    file={files.claimedFile} 
                                    onPick={() => handleFilePick("claimedFile")}
                                    onRemove={() => removeFile("claimedFile")}
                                    error={errors.claimedFile}
                                    required
                                />
                            )}
                        </View>
                    </>
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Ionicons name="shield-checkmark-outline" size={64} color={theme.colors.textSecondary} />
                        <Text style={styles.placeholderText}>Select a product type to proceed</Text>
                    </View>
                )}

            </ScrollView>

            {form.insuranceType && (
                <View style={styles.footer}>
                    <GradientButton
                        onPress={handleSubmit}
                        title={isSubmitting ? (uploadStatus === 'uploading' ? "Uploading Docs..." : "Submitting...") : "Submit Application"}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        style={{ borderRadius: 10, paddingVertical: 16 }}
                    />
                </View>
            )}
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
                <Text style={value ? styles.inputText : styles.placeholderText}>{value ? value.toUpperCase() : `Select`}</Text>
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
                                    <Text style={[styles.pickerOptionText, value === opt && styles.selectedOptionText]}>{opt.toUpperCase()}</Text>
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

const FileUploader = ({ label, file, onPick, onRemove, error, required }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
        {!file ? (
            <TouchableOpacity style={[styles.uploadBox, error && styles.inputError]} onPress={onPick}>
                <Ionicons name="cloud-upload-outline" size={24} color={theme.colors.brandBlue} />
                <Text style={styles.uploadText}>Select File</Text>
            </TouchableOpacity>
        ) : (
            <View style={styles.fileItem}>
                <Ionicons name="document-text" size={20} color={theme.colors.textSecondary} />
                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                <TouchableOpacity onPress={onRemove}>
                    <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                </TouchableOpacity>
            </View>
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

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
    uploadBox: { borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed', borderRadius: 8, height: 50, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, backgroundColor: '#F8FAFC' },
    uploadText: { color: theme.colors.brandBlue, fontWeight: '600', fontSize: 14 },
    fileItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, backgroundColor: '#F1F5F9', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
    fileName: { flex: 1, marginHorizontal: 8, color: '#334155', fontSize: 13 },
    footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
    placeholderContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, opacity: 0.5 },
    placeholderText: { marginTop: 16, fontSize: 16, fontWeight: '500', color: theme.colors.textSecondary },
    checkboxContainer: { flexDirection: 'row', gap: 20, marginBottom: 12 },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F8FAFC', padding: 8, borderRadius: 6, flex: 1, justifyContent: 'center' },
    checkboxText: { fontSize: 14, color: '#334155', fontWeight: '500' }
});