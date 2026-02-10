import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
    Keyboard
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import theme from '../../../constants/theme';
import GradientButton from '../../../components/common/GradientButton';

const SignupScreen = ({ navigation }) => {
    // Registration fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [password, setPassword] = useState('');
    const [rm_referral, setRm_referral] = useState('');
    const [confirmpass, setConfirmpass] = useState('');

    // OTP fields
    const [otp, setOtp] = useState('');

    // UI State
    const [step, setStep] = useState(1); // 1 = Registration, 2 = OTP Verification, 3 = Final Registration
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [timer, setTimer] = useState(0);
    const [userData, setUserData] = useState(null); // Store user data for final registration

    const [showPassword, setShowPassword] = useState(false);

    const { signup, sendOtp, verifyOtp, completeRegistration, token } = useAuth();

    // Timer Logic
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const startTimer = () => setTimer(45);

    // Auto-redirect when token is available (after final registration)
    useEffect(() => {
        if (token) {
            setSuccessMessage('Registration successful! Redirecting to app...');
            // Reset form after delay
            const timeout = setTimeout(() => {
                resetForm();
                // Navigation handled by App.js based on token
            }, 1500);
            return () => clearTimeout(timeout);
        }
    }, [token]);

    const resetForm = () => {
        setStep(1);
        setName('');
        setEmail('');
        setMobile('');
        setCity('');
        setState('');
        setPassword('');
        setConfirmpass('');
        setRm_referral('');
        setOtp('');
        setError('');
        setSuccessMessage('');
        setUserData(null);
    };

    const clearMessages = () => {
        setError('');
        setSuccessMessage('');
    };

    // Validation functions
    const validateStep1 = () => {
        clearMessages();

        if (!name.trim()) {
            setError('Please enter your name');
            return false;
        }
        if (!email.trim()) {
            setError('Please enter your email');
            return false;
        }
        // Basic email regex
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError('Please enter a valid email');
            return false;
        }
        if (!mobile.trim()) {
            setError('Please enter your mobile number');
            return false;
        }
        if (mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
            setError('Please enter a valid 10-digit mobile number');
            return false;
        }
        if (!password) {
            setError('Please enter a password');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (password !== confirmpass) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        setError('');
        if (!otp.trim()) {
            setError('Please enter OTP');
            return false;
        }
        if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
            setError('Please enter a valid 6-digit OTP');
            return false;
        }
        return true;
    };

    const handleSignup = async () => {
        Keyboard.dismiss();

        if (step === 1) {
            if (!validateStep1()) return;

            setLoading(true);
            clearMessages();

            try {
                // STEP 1: Initial Registration
                const result = await signup(name, email, mobile, password, rm_referral, state, city, confirmpass);

                if (!result.success) {
                    setError(result.message);
                    return;
                }

                // Store user data
                const userRegistrationData = {
                    name,
                    email,
                    mobile,
                    state,
                    city,
                    password,
                    confirm_password: confirmpass,
                    rm_referral: rm_referral || ""
                };
                setUserData(userRegistrationData);

                // STEP 2: Send OTP
                const otpResult = await sendOtp(mobile);

                if (!otpResult.success) {
                    if (otpResult.stopFlow) {
                        Alert.alert(
                            'Mobile Number Exists',
                            otpResult.message,
                            [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
                        );
                    } else {
                        setError(otpResult.message);
                    }
                    return;
                }

                // Move to OTP verification step
                setStep(2);
                setSuccessMessage('OTP sent to your mobile number.');
                startTimer();

            } catch (error) {
                console.error('Registration process error:', error);
                setError('An unexpected error occurred. Please try again.');
            } finally {
                setLoading(false);
            }

        } else if (step === 2) {
            if (!validateStep2()) return;

            setLoading(true);
            clearMessages();

            try {
                // STEP 3: Verify OTP
                const result = await verifyOtp(mobile, otp);

                if (!result.success) {
                    setError(result.message);
                    return;
                }

                const registerToken = result.registerToken;

                // STEP 4: Complete Registration
                const finalResult = await completeRegistration(userData, registerToken);

                if (!finalResult.success) {
                    setError(finalResult.message);
                    return;
                }

                setSuccessMessage('Registration completed successfully!');
                // useEffect hook handles redirect on token change

            } catch (error) {
                console.error('Registration error:', error);
                setError('Failed to complete registration. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleResendOtp = async () => {
        Keyboard.dismiss();
        if (!mobile || mobile.length !== 10) {
            setError('Please enter a valid mobile number');
            return;
        }

        if (timer > 0) return;

        setLoading(true);
        clearMessages();

        try {
            const result = await sendOtp(mobile);

            if (!result.success) {
                setError(result.message);
            } else {
                setSuccessMessage('OTP resent successfully!');
                startTimer();
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your name"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your 10-digit mobile number"
                        value={mobile}
                        onChangeText={setMobile}
                        keyboardType="phone-pad"
                        maxLength={10}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>RM Referral Code (Optional)</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="gift-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter referral code if any"
                        value={rm_referral}
                        onChangeText={setRm_referral}
                        autoCapitalize="characters"
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>
            </View>


            {/* state */}

            <View style={styles.inputContainer}>
                <Text style={styles.label}>State</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="gift-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter state"
                        value={state}
                        onChangeText={setState}
                        // autoCapitalize="characters"
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>
            </View>

            {/* city */}

            <View style={styles.inputContainer}>
                <Text style={styles.label}>city</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="gift-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter referral code if any"
                        value={city}
                        onChangeText={setCity}
                        // autoCapitalize="characters"
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Create a secure password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword(prev => !prev)}
                        style={styles.eyeIcon}
                        activeOpacity={0.7}
                    >

                        <Ionicons
                            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                            size={20}
                            color={theme.colors.textSecondary}
                        />

                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm your password"
                        value={confirmpass}
                        onChangeText={setConfirmpass}
                        secureTextEntry={!showPassword}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword(prev => !prev)}
                        style={styles.eyeIcon}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                            size={20}
                            color={theme.colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );

    const renderStep2 = () => (
        <>
            <View style={styles.stepIndicator}>
                <Text style={styles.stepText}>Step 2 of 2: OTP Verification</Text>
            </View>

            <View style={styles.infoContainer}>
                <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.infoText}>
                    A 6-digit OTP has been sent to {mobile}. Please enter it below to verify your account.
                </Text>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Enter OTP</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="key-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                        autoFocus
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>
            </View>

            <TouchableOpacity
                style={styles.resendContainer}
                onPress={handleResendOtp}
                disabled={loading || timer > 0}
            >
                <Text style={[styles.resendText, (loading || timer > 0) && { color: theme.colors.disabled }]}>
                    {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                </Text>
            </TouchableOpacity>
        </>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="account-plus-outline" size={40} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.title}>
                        {step === 1 ? 'Create Account' : 'Verify Mobile'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {step === 1 ? 'Join us to get started with your journey.' : 'Enter OTP to verify your mobile number'}
                    </Text>
                </View>

                <View style={styles.form}>
                    {/* Error Message */}
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* Success Message */}
                    {successMessage ? (
                        <View style={styles.successContainer}>
                            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                            <Text style={styles.successText}>{successMessage}</Text>
                        </View>
                    ) : null}

                    {/* Step Content */}
                    {step === 1 ? renderStep1() : renderStep2()}

                    {/* Action Button */}
                    <GradientButton
                        onPress={handleSignup}
                        title={step === 1 ? 'Sign Up' : 'Verify & Complete Registration'}
                        loading={loading}
                        disabled={loading}
                        icon={<Ionicons name="arrow-forward" size={20} color={theme.colors.white} />}
                        style={{ marginTop: theme.spacing.lg }}
                    />

                    {/* Back Button for OTP Step */}
                    {step === 2 && (
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => {
                                setStep(1);
                                setOtp('');
                                setError('');
                                setSuccessMessage('');
                            }}
                            disabled={loading}
                        >
                            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
                            <Text style={styles.backButtonText}>Back to Registration</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.linkText}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: theme.spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.inactiveTab,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
        textAlign: 'center',
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: theme.spacing.xs,
    },
    form: {
        width: '100%',
    },
    stepIndicator: {
        backgroundColor: theme.colors.primaryLight,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.sm,
        marginBottom: theme.spacing.md,
        alignItems: 'center',
    },
    stepText: {
        color: theme.colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.lg,
        gap: 10,
    },
    infoText: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 14,
        lineHeight: 20,
    },
    inputContainer: {
        marginBottom: theme.spacing.md,
    },
    label: {
        ...theme.typography.label,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
    },
    inputIcon: {
        marginRight: theme.spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        fontSize: 16,
        color: theme.colors.text,
    },
    eyeIcon: {
        paddingHorizontal: 8,
    },
    resendContainer: {
        alignSelf: 'flex-end',
        marginBottom: theme.spacing.lg,
    },
    resendText: {
        color: theme.colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    button: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing.lg,
        ...theme.shadow,
    },
    buttonDisabled: {
        backgroundColor: theme.colors.disabled,
    },
    buttonText: {
        color: theme.colors.white,
        fontSize: 18,
        fontWeight: '700',
    },
    buttonIcon: {
        marginLeft: theme.spacing.sm,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.md,
        marginTop: theme.spacing.sm,
    },
    backButtonText: {
        color: theme.colors.primary,
        fontWeight: '600',
        fontSize: 16,
        marginLeft: theme.spacing.xs,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.sm,
        marginBottom: theme.spacing.md,
        gap: 8,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    successContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DCFCE7',
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.sm,
        marginBottom: theme.spacing.md,
        gap: 8,
    },
    successText: {
        color: theme.colors.success,
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: theme.spacing.xl,
    },
    footerText: {
        color: theme.colors.textSecondary,
        fontSize: 15,
    },
    linkText: {
        color: theme.colors.primary,
        fontWeight: '700',
        fontSize: 15,
    },
});

export default SignupScreen;