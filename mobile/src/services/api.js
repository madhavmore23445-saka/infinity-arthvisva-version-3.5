import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the base URL - prioritizing the production URL as main
// const API_URL = 'https://api.infinityarthvishva.com';

const API_URL = 'http://192.168.1.83:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error attaching token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        // Handle common errors like 401 Unauthorized here if needed
        if (error.response && error.response.status === 401) {
            // Optional: Dispatch logout action or clear storage
            // await AsyncStorage.removeItem('userToken');
            // await AsyncStorage.removeItem('userData');
            console.log('Unauthorized access - potential token expiry');
        }
        return Promise.reject(error);
    }
);

export default api;
