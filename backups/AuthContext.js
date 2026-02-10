// import React, { createContext, useState, useEffect, useContext } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import { Alert } from 'react-native';

// const AuthContext = createContext();

// // Create an axios instance with a default base URL
// // Replace with your local machine's IP address if testing on a physical device
// // const API_URL = 'http://localhost:3000/api';
// // const API_URL = 'http://10.245.129.48:3000/api';

// const API_URL = ' http://192.168.1.58:5000/api';

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [token, setToken] = useState(null);
//     const [loading, setLoading] = useState(true);

//     // Load token on startup
//     // useEffect(() => {
//     //     const loadStorageData = async () => {
//     //         try {
//     //             const storedToken = await AsyncStorage.getItem('userToken');
//     //             const storedUser = await AsyncStorage.getItem('userData');

//     //             if (storedToken) {
//     //                 setToken(storedToken);
//     //                 setUser(JSON.parse(storedUser));
//     //                 // Set default authorization header
//     //                 axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
//     //             }

//     //         } catch (e) {
//     //             console.error('Failed to load storage data', e);
//     //         } finally {
//     //             setLoading(false);
//     //         }
//     //     };

//     //     loadStorageData();
//     // }, []);

//     useEffect(() => {
//         const loadStorageData = async () => {
//             try {
//                 const storedToken = await AsyncStorage.getItem('userToken');
//                 const storedUser = await AsyncStorage.getItem('userData');

//                 if (storedToken) {
//                     setToken(storedToken);
//                     axios.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
//                 }

//                 if (storedUser) {
//                     setUser(JSON.parse(storedUser));
//                 } else {
//                     setUser(null);
//                 }

//             } catch (e) {
//                 console.error('Failed to load storage data', e);
//                 setUser(null);
//                 setToken(null);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         loadStorageData();
//     }, []);

//     const login = async (identifier, password) => {
//         try {
//            // Alert.alert('LOGIN FUNCTION CALLED');
//             const response = await axios.post(`${API_URL}/auth/login`, { identifier, password });
//             const { token, user } = response.data;

//             //console.log(response);
//             console.log(token);
//             console.log(user);

//             await AsyncStorage.setItem('userToken', token);
//             await AsyncStorage.setItem('userData', JSON.stringify(user));

//             setToken(token);
//             setUser(user);
//             console.log(token);
//             console.log(user);
//             axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//             return { success: true };
//         } catch (error) {
//             return {
//                 success: false,
//                 message: error.response?.data?.message || 'Login failed'
//             };
//         }
//     };

//     const loginWithOtp = async (identifier, otp) => {
//         try {
//             Alert.alert('LOGIN FUNCTION CALLED');
//             const response = await axios.post(`${API_URL}/auth/login/otp/verify`, { identifier, password });
//             const { token, user } = response.data;

//             //console.log(response);
//             console.log(token);
//             console.log(user);

//             await AsyncStorage.setItem('userToken', token);
//             await AsyncStorage.setItem('userData', JSON.stringify(user));

//             setToken(token);
//             setUser(user);
//             console.log(token);
//             console.log(user);
//             axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//             return { success: true };



//         } catch (error) {
//             return {
//                 success: false,
//                 message: error.response?.data?.message || 'Login failed'
//             };

//         }
//     }

//     const signup = async (name, email, password, mobile, rm_referral, confirmpass) => {
//         try {
//              Alert.alert("signup is getting called ")
//             const response = await axios.post(`${API_URL}/auth/register`, { name, email, mobile, password, confirmpass  , rm_referral});
//             const { message } = response.data;

//             Alert.alert("signup is getting called ")
//             console.log(message);

//             // await AsyncStorage.setItem('userToken', token);
//             // await AsyncStorage.setItem('userData', JSON.stringify(userData));

//             // setToken(token);
//             // setUser(userData);
//             // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//             return { success: true };
//         } catch (error) {
//             return {
//                 success: false,
//                 message: error.response?.data?.message || 'Signup failed'
//             };
//         }
//     };

//     const logout = async () => {
//         await AsyncStorage.removeItem('userToken');
//         await AsyncStorage.removeItem('userData');
//         setToken(null);
//         setUser(null);
//         delete axios.defaults.headers.common['Authorization'];
//     };

//     return (
//         <AuthContext.Provider value={{ user, token, loading, login, signup,loginWithOtp, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => useContext(AuthContext);
