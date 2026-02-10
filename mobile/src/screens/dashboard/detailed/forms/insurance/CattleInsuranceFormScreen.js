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
    ActivityIndicator,
    Platform,
    Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { DashboardService } from '../../../../../services/dashboardService';
import theme from '../../../../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import DatePickerInput from '../../../../../components/common/DatePickerInput';
import GradientButton from '../../../../../components/common/GradientButton';

const MAX_FILE_SIZE_BYTES = 200 * 1024; // 200KB

export default function CattleInsuranceFormScreen() {
    const navigation = useNavigation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [form, setForm] = useState({
        clientName: "", phone: "", email: "", dob: "", location: "",
        farmName: "", liveStock: "", breed: "", gender: "",
        age: "", color: "", tagNo: "", financer: "", lossRatio: ""
    });

    // Errors State
    const [errors, setErrors] = useState({});

    // Document State
    const [prevPolicyFile, setPrevPolicyFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error

    const handleInputChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const validate = () => {
        const errs = {};
        const req = (f, msg) => { if (!String(form[f] || "").trim()) errs[f] = msg; };

        req("clientName", "Client Name is required");
        req("email", "Email is required");
        req("dob", "DOB is required");
        req("location", "Location is required");

        req("farmName", "Farm Name is required");
        req("liveStock", "Livestock name is required");
        req("breed", "Breed is required");
        req("gender", "Select gender");
        req("age", "Age is required");
        req("color", "Color is required");
        req("tagNo", "Tag Number is required");
        req("financer", "Financer is required");
        req("lossRatio", "Loss ratio is required");

        if (!form.phone) errs.phone = "Phone is required";
        else if (form.phone.length !== 10) errs.phone = "Must be 10 digits";

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
                setPrevPolicyFile(file);
                setUploadStatus('idle'); // Reset status if new file picked
            }
        } catch (err) {
            console.error(err);
        }
    };

    const removeFile = () => {
        setPrevPolicyFile(null);
        setUploadStatus('idle');
    };

    const handleSubmit = async () => {
        if (!validate()) {
            Alert.alert("Error", "Please fill all required fields correctly.");
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Create Lead
            const payload = {
                department: "Insurance",
                product_type: "Cattle Insurance",
                sub_category: "Cattle Insurance",
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
                    location: form.location,
                    farmName: form.farmName,
                    liveStock: form.liveStock,
                    breed: form.breed,
                    gender: form.gender,
                    age: form.age,
                    color: form.color,
                    tagNo: form.tagNo,
                    financer: form.financer,
                    lossRatio: form.lossRatio
                }
            };

            const result = await DashboardService.createLead(payload);
            const leadId = result?.detail_lead_id;

            if (!leadId) throw new Error("Lead ID missing in response");

            // 2. Upload Document if selected
            if (prevPolicyFile) {
                setUploadStatus('uploading');
                const formData = new FormData();
                formData.append("leadDbId", leadId);
                formData.append("metadata", JSON.stringify([{ key: "PREV_POLICY", label: "Prev. Year Policy" }]));

                const fileObj = {
                    uri: prevPolicyFile.uri,
                    name: prevPolicyFile.name,
                    type: prevPolicyFile.mimeType || 'application/octet-stream'
                };
                formData.append("documents", fileObj);

                await DashboardService.uploadLeadDocument(leadId, formData);
                setUploadStatus('success');
            }

            Alert.alert("Success", "Cattle Insurance Application Submitted Successfully!", [
                { text: "OK", onPress: () => navigation.navigate("LeadManagement") }
            ]);

        } catch (err) {
            console.error("Submission error:", err);
            Alert.alert("Error", err.response?.data?.message || "Failed to submit application. Please try again.");
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
                <Text style={styles.headerTitle}>Cattle Insurance Form</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Personal Info */}
                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Personal Information</Text>
                    <InputGroup label="Client Name" required value={form.clientName} onChange={v => handleInputChange("clientName", v)} error={errors.clientName} placeholder="Enter full name" />
                    <InputGroup label="Phone Number" required keyboardType="numeric" maxLength={10} value={form.phone} onChange={v => handleInputChange("phone", v)} error={errors.phone} placeholder="10-digit number" />
                    <InputGroup label="Email ID" required keyboardType="email-address" value={form.email} onChange={v => handleInputChange("email", v)} error={errors.email} placeholder="Enter email address" />
                    <DatePickerInput
                        label="Date of Birth"
                        required
                        value={form.dob}
                        onChange={v => handleInputChange("dob", v)}
                        maximumDate={new Date()}
                        error={errors.dob}
                    />
                    <InputGroup label="Location" required value={form.location} onChange={v => handleInputChange("location", v)} error={errors.location} placeholder="Enter city/location" />
                </View>

                {/* Farm & Cattle Info */}
                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Farm & Cattle Details</Text>
                    <InputGroup label="Farm / Company Name" required value={form.farmName} onChange={v => handleInputChange("farmName", v)} error={errors.farmName} placeholder="Enter farm name" />
                    <InputGroup label="Name of Live Stock" required value={form.liveStock} onChange={v => handleInputChange("liveStock", v)} error={errors.liveStock} placeholder="Enter livestock name" />
                    <InputGroup label="Breed of Goat / Sheep" required value={form.breed} onChange={v => handleInputChange("breed", v)} error={errors.breed} placeholder="Enter breed" />

                    <CustomPicker
                        label="Gender"
                        required
                        value={form.gender}
                        options={["Male", "Female"]}
                        onSelect={v => handleInputChange("gender", v)}
                        error={errors.gender}
                    />

                    <InputGroup label="Age" required keyboardType="numeric" value={form.age} onChange={v => handleInputChange("age", v)} error={errors.age} placeholder="Enter age" />
                    <InputGroup label="Color" required value={form.color} onChange={v => handleInputChange("color", v)} error={errors.color} placeholder="Enter color" />
                    <InputGroup label="Tag Number" required keyboardType="numeric" value={form.tagNo} onChange={v => handleInputChange("tagNo", v)} error={errors.tagNo} placeholder="Enter tag number" />
                    <InputGroup label="Financer Bank Name" required value={form.financer} onChange={v => handleInputChange("financer", v)} error={errors.financer} placeholder="Enter bank name" />
                    <InputGroup label="Loss Ratio Details" required value={form.lossRatio} onChange={v => handleInputChange("lossRatio", v)} error={errors.lossRatio} placeholder="Enter loss ratio" />
                </View>

                {/* Documents */}
                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Documents (Optional)</Text>
                    <Text style={styles.cardSubHeader}>Prev. Year Policy (Max 200KB)</Text>

                    {!prevPolicyFile ? (
                        <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
                            <Ionicons name="cloud-upload-outline" size={24} color={theme.colors.brandBlue} />
                            <Text style={styles.uploadText}>Select File</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.fileItem}>
                            <Ionicons name="document-text" size={20} color={theme.colors.textSecondary} />
                            <Text style={styles.fileName} numberOfLines={1}>{prevPolicyFile.name}</Text>
                            <TouchableOpacity onPress={removeFile}>
                                <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

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

// --- Reusable Components (Keep consistent with other forms) ---

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

            <PlatformModal visible={modalVisible} onClose={() => setModalVisible(false)}>
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
            </PlatformModal>
        </View>
    );
};

// Simple wrapper for Modal to handle Android/iOS consistency if needed
const PlatformModal = ({ visible, onClose, children }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                {children}
            </View>
        </Modal>
    )
}

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
