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
import DatePickerInput from '../../../../../components/common/DatePickerInput';
import GradientButton from '../../../../../components/common/GradientButton';

export default function TravelInsuranceFormScreen() {
    const navigation = useNavigation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [form, setForm] = useState({
        clientName: "", phone: "", email: "", dob: "", location: "",
        designation: "", duration: "", transport: "", sumAssured: ""
    });

    // Errors State
    const [errors, setErrors] = useState({});

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
        req("duration", "Duration is required");
        req("transport", "Transport mode is required");
        req("sumAssured", "Sum assured is required");

        if (!form.phone) errs.phone = "Phone is required";
        else if (form.phone.length !== 10) errs.phone = "Must be 10 digits";

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
                product_type: "Travel Insurance",
                sub_category: "Travel Insurance",
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
                    designation: form.designation,
                    duration: form.duration,
                    transport: form.transport,
                    sumAssured: `${form.sumAssured}.00`
                }
            };

            await DashboardService.createLead(payload);

            Alert.alert("Success", "Travel Insurance Application Submitted Successfully!", [
                { text: "OK", onPress: () => navigation.navigate("LeadManagement") }
            ]);

        } catch (err) {
            console.error("Submission error:", err);
            Alert.alert("Error", err.response?.data?.message || "Failed to submit application. Please try again.");
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
                <Text style={styles.headerTitle}>Travel Insurance Form</Text>
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
                    <InputGroup label="Designation" value={form.designation} onChange={v => handleInputChange("designation", v)} error={errors.designation} placeholder="Enter designation" />
                </View>

                {/* Travel Info */}
                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Travel Details</Text>
                    <InputGroup label="Duration of Travel" required value={form.duration} onChange={v => handleInputChange("duration", v)} error={errors.duration} placeholder="e.g. 15 days" />

                    <CustomPicker
                        label="Mode of Transport"
                        required
                        value={form.transport}
                        options={["Air", "Sea", "Land"]}
                        onSelect={v => handleInputChange("transport", v)}
                        error={errors.transport}
                    />

                    <InputGroup label="Sum Assured Amount" required keyboardType="numeric" value={form.sumAssured} onChange={v => handleInputChange("sumAssured", v)} error={errors.sumAssured} placeholder="Enter amount" />
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

// --- Reusable Components (Same as Cattle Insurance) ---

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

// Simple wrapper for Modal
const PlatformModal = ({ visible, onClose, children }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
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
