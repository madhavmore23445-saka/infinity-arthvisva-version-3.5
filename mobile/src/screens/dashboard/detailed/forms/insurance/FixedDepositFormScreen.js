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
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { DashboardService } from '../../../../../services/dashboardService';
import theme from '../../../../../constants/theme';
import GradientButton from '../../../../../components/common/GradientButton';
import DatePickerInput from '../../../../../components/common/DatePickerInput';

export default function FixedDepositFormScreen() {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    clientName: '',
    phone: '',
    email: '',
    dob: '',
    gender: '',
    location: '',
    monthlyIncome: '',
    termValue: '',
    termType: 'months',
    depositAmount: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    if (field === 'termType') {
      setForm((prev) => ({ ...prev, termType: value, termValue: '' }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const errs = {};

    const req = (f, msg) => {
      if (!form[f]?.trim()) errs[f] = msg;
    };

    req('clientName', 'Name is required');
    req('dob', 'Date of birth is required');
    req('gender', 'Select gender');
    req('location', 'Location is required');
    req('monthlyIncome', 'Income is required');
    req('depositAmount', 'Deposit amount is required');
    req('termValue', 'Term value is required');

    if (!form.phone) errs.phone = 'Phone is required';
    else if (form.phone.length !== 10) errs.phone = 'Must be 10 digits';

    if (!form.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Invalid email';
    }

    if (form.termValue && parseInt(form.termValue) <= 0) {
      errs.termValue = 'Value must be greater than 0';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Error', 'Please fill all required fields correctly.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        department: 'Investment',
        product_type: 'Fixed Deposit',
        sub_category: 'Fixed Deposit',
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
          gender: form.gender,
          location: form.location,
          monthlyIncome: form.monthlyIncome,
          termValue: form.termValue,
          termType: form.termType,
          depositAmount: form.depositAmount,
        },
      };

      await DashboardService.createLead(payload);
      setShowSuccess(true);
    } catch (err) {
      console.error('Submission error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filterDigits = (text) => text.replace(/[^0-9]/g, '');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Fixed Deposit Form</Text>
          <Text style={styles.subHeader}>Investment application</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Applicant Details */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Applicant Details</Text>

          <InputGroup
            label="Full Name"
            required
            value={form.clientName}
            onChange={(v) => handleInputChange('clientName', v)}
            error={errors.clientName}
            placeholder="Enter full name"
          />

          <InputGroup
            label="Phone Number"
            required
            value={form.phone}
            onChange={(v) => handleInputChange('phone', filterDigits(v))}
            error={errors.phone}
            placeholder="10-digit mobile"
            keyboardType="phone-pad"
            maxLength={10}
          />

          <InputGroup
            label="Email ID"
            required
            value={form.email}
            onChange={(v) => handleInputChange('email', v)}
            error={errors.email}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <DatePickerInput
            label="Date of Birth"
            required
            value={form.dob}
            onChange={(v) => handleInputChange('dob', v)}
            maximumDate={new Date()}
            error={errors.dob}
          />

          <CustomPicker
            label="Gender"
            required
            value={form.gender}
            options={['Male', 'Female']}
            onSelect={(v) => handleInputChange('gender', v)}
            error={errors.gender}
          />

          <InputGroup
            label="Location"
            required
            value={form.location}
            onChange={(v) => handleInputChange('location', v)}
            error={errors.location}
            placeholder="Enter city"
          />

          <InputGroup
            label="Total Monthly Income"
            required
            value={form.monthlyIncome}
            onChange={(v) => handleInputChange('monthlyIncome', filterDigits(v))}
            error={errors.monthlyIncome}
            placeholder="Enter monthly income"
            keyboardType="numeric"
          />
        </View>

        {/* Fixed Deposit Details */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Fixed Deposit Details</Text>

          <TermInput
            value={form.termValue}
            type={form.termType}
            onValueChange={(v) => handleInputChange('termValue', filterDigits(v))}
            onTypeChange={(v) => handleInputChange('termType', v)}
            error={errors.termValue}
          />

          <InputGroup
            label="Fixed Deposit Amount"
            required
            value={form.depositAmount}
            onChange={(v) => handleInputChange('depositAmount', filterDigits(v))}
            error={errors.depositAmount}
            placeholder="Enter deposit amount"
            keyboardType="numeric"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          onPress={handleSubmit}
          title={isSubmitting ? 'Submitting...' : 'Submit Application'}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={{ borderRadius: 10, paddingVertical: 16 }}
        />
      </View>

      <SuccessModal visible={showSuccess} onClose={() => navigation.goBack()} />
    </SafeAreaView>
  );
}

// ---------- Reusable Components ----------

const InputGroup = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  keyboardType,
  maxLength,
  autoCapitalize,
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>
      {label} {required && <Text style={styles.required}>*</Text>}
    </Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textSecondary}
      keyboardType={keyboardType}
      maxLength={maxLength}
      autoCapitalize={autoCapitalize}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const CustomPicker = ({ label, value, options, onSelect, error, required }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.input, styles.pickerInput, error && styles.inputError]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={value ? styles.inputText : styles.placeholderText}>
          {value || `Select ${label}`}
        </Text>
        <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent
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
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.pickerOption}
                  onPress={() => {
                    onSelect(opt);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      value === opt && styles.selectedOptionText,
                    ]}
                  >
                    {opt}
                  </Text>
                  {value === opt && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={theme.colors.brandTeal}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const TermInput = ({ value, type, onValueChange, onTypeChange, error }) => {
  const maxLength = type === 'months' ? 3 : 2;

  return (
    <View style={styles.termContainer}>
      <Text style={styles.label}>
        Term <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.termRow}>
        <View style={styles.termValueWrapper}>
          <TextInput
            style={[styles.input, styles.termInput, error && styles.inputError]}
            value={value}
            onChangeText={onValueChange}
            placeholder={type === 'months' ? 'Months' : 'Years'}
            keyboardType="numeric"
            maxLength={maxLength}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
        <View style={styles.termTypeWrapper}>
          <TouchableOpacity
            style={[styles.input, styles.pickerInput, { flex: 1 }]}
            onPress={() => {
              // We can't show a modal here directly, so we rely on the parent
              // to toggle a modal for termType selection. However, for simplicity,
              // we provide two buttons to switch between months/years directly.
            }}
          >
            <Text style={styles.inputText}>
              {type === 'months' ? 'Months' : 'Years'}
            </Text>
            {/* We'll implement a quick toggle for better UX */}
          </TouchableOpacity>
          <View style={styles.termToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                type === 'months' && styles.toggleActive,
              ]}
              onPress={() => onTypeChange('months')}
            >
              <Text
                style={[
                  styles.toggleText,
                  type === 'months' && styles.toggleTextActive,
                ]}
              >
                Months
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                type === 'years' && styles.toggleActive,
              ]}
              onPress={() => onTypeChange('years')}
            >
              <Text
                style={[
                  styles.toggleText,
                  type === 'years' && styles.toggleTextActive,
                ]}
              >
                Years
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Text style={styles.termHint}>
        {type === 'months' ? 'Maximum 3 digits' : 'Maximum 2 digits'}
      </Text>
    </View>
  );
};

const SuccessModal = ({ visible, onClose }) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.successOverlay}>
      <View style={styles.successContainer}>
        <Ionicons name="checkmark-circle" size={64} color={theme.colors.brandTeal} />
        <Text style={styles.successTitle}>Success!</Text>
        <Text style={styles.successMessage}>
          Your Fixed Deposit application has been submitted successfully.
        </Text>
        <TouchableOpacity style={styles.successButton} onPress={onClose}>
          <Text style={styles.successButtonText}>Okay, Got it</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// ---------- Styles ----------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  subHeader: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  required: {
    color: theme.colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1E293B',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  pickerInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  pickerOptionText: {
    fontSize: 15,
    color: '#475569',
  },
  selectedOptionText: {
    color: theme.colors.brandTeal,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  // Term specific styles
  termContainer: {
    marginBottom: 16,
  },
  termRow: {
    flexDirection: 'row',
    gap: 8,
  },
  termValueWrapper: {
    flex: 2,
  },
  termInput: {
    width: '100%',
  },
  termTypeWrapper: {
    flex: 1,
  },
  termToggle: {
    flexDirection: 'row',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  toggleActive: {
    backgroundColor: theme.colors.brandTeal,
  },
  toggleText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#fff',
  },
  termHint: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 6,
  },
  // Success modal styles
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  successButton: {
    backgroundColor: theme.colors.brandTeal,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  successButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});