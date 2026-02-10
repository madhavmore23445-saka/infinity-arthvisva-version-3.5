// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
// import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import { useAuth } from '../context/AuthContext';
// import theme from '../constants/theme';

// const SignupScreen = ({ navigation }) => {
//     const [name, setName] = useState('');
//     const [email, setEmail] = useState('');
//     const [mobile, setMobile] = useState('')
//     const [password, setPassword] = useState('');
//     const [rm_referral, setRm_referral] = useState('');
//     const [confirmpass, setConfirmpass] = useState('');
//     const [error, setError] = useState('');
//     const { signup } = useAuth();

//     const handleSignup = async () => {
//         if (!name || !email || !password || !phone || !confirmpass) {
//             setError('Please fill in all fields');
//             return;
//         }
//         const result = await signup(name, email, password, mobile, rm_referral , confirmpass);
//         if (!result.success) {
//             setError(result.message);
//         }
//     };

//     return (
//         <KeyboardAvoidingView
//             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//             style={styles.container}
//         >
//             <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//                 <View style={styles.header}>
//                     <View style={styles.iconContainer}>
//                         <MaterialCommunityIcons name="account-plus-outline" size={40} color={theme.colors.primary} />
//                     </View>
//                     <Text style={styles.title}>Create Account</Text>
//                     <Text style={styles.subtitle}>Join us to get started with your journey.</Text>
//                 </View>

//                 <View style={styles.form}>
//                     {error ? (
//                         <View style={styles.errorContainer}>
//                             <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
//                             <Text style={styles.errorText}>{error}</Text>
//                         </View>
//                     ) : null}

//                     <View style={styles.inputContainer}>
//                         <Text style={styles.label}>Full Name</Text>
//                         <View style={styles.inputWrapper}>
//                             <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
//                             <TextInput
//                                 style={styles.input}
//                                 placeholder="Enter your name"
//                                 value={name}
//                                 onChangeText={setName}
//                             />
//                         </View>
//                     </View>

//                     <View style={styles.inputContainer}>
//                         <Text style={styles.label}>Email</Text>
//                         <View style={styles.inputWrapper}>
//                             <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
//                             <TextInput
//                                 style={styles.input}
//                                 placeholder="Enter your email"
//                                 value={email}
//                                 onChangeText={setEmail}
//                                 keyboardType="email-address"
//                                 autoCapitalize="none"
//                             />
//                         </View>
//                     </View>

//                     <View style={styles.inputContainer}>
//                         <Text style={styles.label}>Phone</Text>
//                         <View style={styles.inputWrapper}>
//                             <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
//                             <TextInput
//                                 style={styles.input}
//                                 placeholder="Enter your 10-digit phone"
//                                 value={mobile}
//                                 onChangeText={setMobile}
//                                 keyboardType="phone-pad"
//                                 maxLength={10}
//                             />
//                         </View>
//                     </View>

//                     <View style={styles.inputContainer}>
//                         <Text style={styles.label}>RM Referral Code (Optional)</Text>
//                         <View style={styles.inputWrapper}>
//                             <Ionicons name="gift-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
//                             <TextInput
//                                 style={styles.input}
//                                 placeholder="Referral Code"
//                                 value={rm_referral}
//                                 onChangeText={setRm_referral}
//                             />
//                         </View>
//                     </View>

//                     <View style={styles.inputContainer}>
//                         <Text style={styles.label}>Password</Text>
//                         <View style={styles.inputWrapper}>
//                             <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
//                             <TextInput
//                                 style={styles.input}
//                                 placeholder="Create a password"
//                                 value={password}
//                                 onChangeText={setPassword}
//                                 secureTextEntry
//                             />
//                         </View>
//                     </View>

//                     {/* confirm password filed */}

//                     <View style={styles.inputContainer}>
//                         <Text style={styles.label}>COnfirm Password</Text>
//                         <View style={styles.inputWrapper}>
//                             <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
//                             <TextInput
//                                 style={styles.input}
//                                 placeholder="confirm password"
//                                 value={confirmpass}
//                                 onChangeText={setConfirmpass}
//                                 secureTextEntry
//                             />
//                         </View>
//                     </View>



//                     <TouchableOpacity style={styles.button} onPress={handleSignup}>
//                         <Text style={styles.buttonText}>Sign Up</Text>
//                         <Ionicons name="arrow-forward" size={20} color={theme.colors.white} style={styles.buttonIcon} />
//                     </TouchableOpacity>

//                     <View style={styles.footer}>
//                         <Text style={styles.footerText}>Already have an account? </Text>
//                         <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//                             <Text style={styles.linkText}>Login</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </ScrollView>
//         </KeyboardAvoidingView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: theme.colors.background,
//     },
//     scrollContent: {
//         flexGrow: 1,
//         justifyContent: 'center',
//         padding: theme.spacing.lg,
//     },
//     header: {
//         alignItems: 'center',
//         marginBottom: theme.spacing.xl,
//     },
//     iconContainer: {
//         width: 80,
//         height: 80,
//         borderRadius: 40,
//         backgroundColor: theme.colors.inactiveTab,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: theme.spacing.md,
//     },
//     title: {
//         ...theme.typography.h1,
//         color: theme.colors.text,
//         textAlign: 'center',
//     },
//     subtitle: {
//         ...theme.typography.body,
//         color: theme.colors.textSecondary,
//         textAlign: 'center',
//         marginTop: theme.spacing.xs,
//     },
//     form: {
//         width: '100%',
//     },
//     inputContainer: {
//         marginBottom: theme.spacing.md,
//     },
//     label: {
//         ...theme.typography.label,
//         color: theme.colors.textSecondary,
//         marginBottom: theme.spacing.xs,
//     },
//     inputWrapper: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: theme.colors.white,
//         borderWidth: 1,
//         borderColor: theme.colors.border,
//         borderRadius: theme.borderRadius.md,
//         paddingHorizontal: theme.spacing.md,
//     },
//     inputIcon: {
//         marginRight: theme.spacing.sm,
//     },
//     input: {
//         flex: 1,
//         paddingVertical: theme.spacing.md,
//         fontSize: 16,
//         color: theme.colors.text,
//     },
//     button: {
//         backgroundColor: theme.colors.primary,
//         flexDirection: 'row',
//         padding: theme.spacing.md,
//         borderRadius: theme.borderRadius.md,
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginTop: theme.spacing.lg,
//         ...theme.shadow,
//     },
//     buttonText: {
//         color: theme.colors.white,
//         fontSize: 18,
//         fontWeight: '700',
//     },
//     buttonIcon: {
//         marginLeft: theme.spacing.sm,
//     },
//     errorContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#FEE2E2',
//         padding: theme.spacing.sm,
//         borderRadius: theme.borderRadius.sm,
//         marginBottom: theme.spacing.md,
//         gap: 8,
//     },
//     errorText: {
//         color: theme.colors.error,
//         fontSize: 14,
//         fontWeight: '500',
//     },
//     footer: {
//         flexDirection: 'row',
//         justifyContent: 'center',
//         marginTop: theme.spacing.xl,
//     },
//     footerText: {
//         color: theme.colors.textSecondary,
//         fontSize: 15,
//     },
//     linkText: {
//         color: theme.colors.primary,
//         fontWeight: '700',
//         fontSize: 15,
//     },
// });

// export default SignupScreen;
