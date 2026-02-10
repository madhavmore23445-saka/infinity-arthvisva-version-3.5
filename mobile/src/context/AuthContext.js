import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../services/AuthService';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registerToken, setRegisterToken] = useState(null); // Store temporary register token

    // Load token on startup
    useEffect(() => {
        const loadStorageData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('userToken');
                const storedUser = await AsyncStorage.getItem('userData');

                if (storedToken) {
                    setToken(storedToken);
                    // Axios interceptors in api.js will handle the header based on AsyncStorage
                }

                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    setUser(null);
                }
            } catch (e) {
                console.error('Failed to load storage data', e);
                setUser(null);
                setToken(null);
            } finally {
                setLoading(false);
            }
        };

        loadStorageData();
    }, []);

    // LOGIN WITH PASSWORD
    const login = async (identifier, password) => {
        try {
            const data = await AuthService.login({ identifier, password });
            const { token, user } = data;

            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(user));

            setToken(token);
            setUser(user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    // SEND LOGIN OTP
    const sendLoginOtp = async (identifier) => {
        try {
            const data = await AuthService.sendLoginOtp({ identifier });
            return {
                success: true,
                message: data?.message || 'OTP sent successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to send OTP'
            };
        }
    };

    // LOGIN WITH OTP (VERIFY)
    const loginWithOtp = async (identifier, otp) => {
        try {
            const data = await AuthService.verifyLoginOtp({ identifier, otp });
            const { token, user } = data;

            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(user));

            setToken(token);
            setUser(user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'OTP Login failed'
            };
        }
    };

    // PHASE 1: INITIAL REGISTRATION
    const signup = async (name, email, mobile, password, rm_referral,state , city, confirmpass) => {
        try {
            const data = await AuthService.register({
                name,
                email,
                mobile,
                password,
                state,
                city,
                confirm_password: confirmpass,
                rm_referral: rm_referral || ""
            });

            return {
                success: true,
                message: data?.message || 'OTP verification required.',
                data: data
            };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed';

            // If backend says OTP verification required, treat as success
            if (errorMessage.toLowerCase().includes('otp') ||
                errorMessage.toLowerCase().includes('verification required')) {
                return {
                    success: true,
                    message: 'OTP verification required.'
                };
            }

            return {
                success: false,
                message: errorMessage
            };
        }
    };

    // PHASE 2: SEND OTP TO MOBILE
    const sendOtp = async (mobile) => {
        try {
            const data = await AuthService.sendRegisterOtp({ mobile });
            return {
                success: true,
                message: data?.message || 'OTP sent successfully'
            };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to send OTP';

            // Handle mobile already exists case
            if (errorMessage.toLowerCase().includes('already in use') ||
                errorMessage.toLowerCase().includes('already exists')) {
                return {
                    success: false,
                    message: 'This mobile number is already registered. Please use a different number or login.',
                    stopFlow: true // Flag to stop the registration flow
                };
            }

            return {
                success: false,
                message: errorMessage
            };
        }
    };

    // PHASE 3: VERIFY OTP
    const verifyOtp = async (mobile, otp) => {
        try {
            const data = await AuthService.verifyRegisterOtp({ mobile, otp });
            const { message, registerToken } = data;

            if (!registerToken) {
                throw new Error('No register token received from server');
            }

            // Store registerToken temporarily (not as auth token)
            setRegisterToken(registerToken);

            return {
                success: true,
                message: message || 'OTP verified successfully',
                registerToken
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Invalid OTP'
            };
        }
    };

    // PHASE 4: FINAL REGISTRATION WITH REGISTER TOKEN
    const completeRegistration = async (userData, registerToken) => {
        try {
            const data = await AuthService.register({
                ...userData,
                registerToken
            });

            const { message, user: registeredUser } = data;

            if (!registerToken) {
                throw new Error('Register token missing');
            }

            // ✅ Treat registerToken as auth token
            await AsyncStorage.setItem('userToken', registerToken);
            await AsyncStorage.setItem('userData', JSON.stringify(registeredUser));

            setToken(registerToken);
            setUser(registeredUser);
            setRegisterToken(null); // clear temp token

            return {
                success: true,
                message: message || 'Registration successful!',
                user: registeredUser,
                token: registerToken
            };

        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to complete registration'
            };
        }
    };

    // FETCH FULL PROFILE
    const fetchUserProfile = async () => {
        try {
            const data = await AuthService.getProfile();
            const { user } = data; // Assuming response structure { message, user: {...} }

            if (user) {
                await AsyncStorage.setItem('userData', JSON.stringify(user));
                setUser(user);
                return { success: true, user };
            } else {
                return { success: false, message: 'No user data received' };
            }
        } catch (error) {
            console.error('Fetch profile error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch user profile'
            };
        }
    };

    // LOGOUT
    const logout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
        } catch (e) {
            console.error('Logout error:', e);
        }
        setToken(null);
        setUser(null);
        setRegisterToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                registerToken,
                login,
                signup,
                loginWithOtp,
                sendLoginOtp,
                logout,
                sendOtp,
                verifyOtp,
                completeRegistration,
                fetchUserProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);