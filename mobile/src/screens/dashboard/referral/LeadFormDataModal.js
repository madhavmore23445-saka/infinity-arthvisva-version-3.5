import React from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../../constants/theme';
import GradientButton from '../../../components/common/GradientButton';

const KEY_LABELS = {
    clientName: "Client Name",
    phone: "Phone Number",
    email: "Email ID",
    dob: "DOB",
    location: "Location",
    loanAmount: "Loan Amount",
    loanType: "Loan Type",
    employmentType: "Employment Type",
    bankName: "Bank Name",
    rmName: "RM Name",
    rmContact: "RM Contact",
    rmEmail: "RM Email",
    fileId: "File Number",
    refId: "Reference ID",
    hasOtherLoan: "Has Other Loan",
    otherLoanAmount: "Other Loan Amount",
    otherIncome: "Other Income",
    otherIncomeAmount: "Other Income Amount",
    deductionDetails: "Deduction Details",
    companyName: "Company Name",
    companyAddress: "Company Address"
};

export default function LeadFormDataModal({ visible, onClose, lead }) {
    if (!lead) return null;

    // Use original leads form_data or fallback to flattening the lead object itself if structure varies
    const formData = lead.original?.form_data || lead.form_data || {};

    // Filter out empty keys or keys we don't want to show
    const keys = Object.keys(formData).filter(k => formData[k] && KEY_LABELS[k]);

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Lead Form Data</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.listContent}>
                        {keys.length === 0 ? (
                            <Text style={styles.emptyText}>No form data available.</Text>
                        ) : (
                            keys.map((key) => (
                                <View key={key} style={styles.row}>
                                    <Text style={styles.label}>{KEY_LABELS[key] || key}</Text>
                                    <Text style={styles.value}>{formData[key]}</Text>
                                </View>
                            ))
                        )}
                        {/* Always show extra meta info if available */}
                        {lead.original?.department && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Department</Text>
                                <Text style={styles.value}>{lead.original.department}</Text>
                            </View>
                        )}
                        {lead.original?.sub_category && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Sub Category</Text>
                                <Text style={styles.value}>{lead.original.sub_category}</Text>
                            </View>
                        )}
                    </ScrollView>

                    <View style={styles.footer}>
                        <GradientButton
                            onPress={onClose}
                            title="CLOSE"
                            style={{ width: 100, height: 40, borderRadius: 8 }}
                            textStyle={{ fontSize: 14 }}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 12, maxHeight: '80%', width: '100%', overflow: 'hidden' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    title: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    listContent: { padding: 16 },
    row: { marginBottom: 16 },
    label: { fontSize: 11, color: theme.colors.textSecondary, textTransform: 'uppercase', marginBottom: 4, fontWeight: '600' },
    value: { fontSize: 15, color: theme.colors.text, fontWeight: '500' },
    emptyText: { textAlign: 'center', color: theme.colors.textSecondary, marginTop: 20 },
    footer: { padding: 16, borderTopWidth: 1, borderTopColor: theme.colors.border, alignItems: 'flex-end' },
    closeBtn: { backgroundColor: theme.colors.surface, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6 },
    closeBtnText: { fontWeight: 'bold', color: theme.colors.text }
});
