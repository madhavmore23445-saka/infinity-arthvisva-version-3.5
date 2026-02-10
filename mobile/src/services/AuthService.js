import api from './api';

const AuthService = {
    // 🔹 Login endpoint → /api/auth/login
    login: async ({ identifier, password }) => {
        const response = await api.post("/api/auth/login", { identifier, password });
        return response.data;
    },

    // 🔹 REGISTER (FINAL STEP)
    register: async (formData) => {
        const response = await api.post("/api/auth/register", formData);
        return response.data;
    },

    // 🔹 SEND OTP FOR REGISTER
    sendRegisterOtp: async (data) => {
        const response = await api.post("/api/auth/register/send-otp", data);
        return response.data;
    },

    // 🔹 VERIFY OTP FOR REGISTER
    verifyRegisterOtp: async (data) => {
        const response = await api.post("/api/auth/register/verify-otp", data);
        return response.data;
    },

    // 🔹 SEND OTP FOR LOGIN
    sendLoginOtp: async (data) => {
        const response = await api.post("/api/auth/login/otp/send", data);
        return response.data;
    },

    // 🔹 VERIFY OTP FOR LOGIN
    verifyLoginOtp: async (data) => {
        const response = await api.post("/api/auth/login/otp/verify", data);
        return response.data;
    },

    // 🔹 Get current user's dashboard profile data
    getProfile: async () => {
        const response = await api.get("/api/dashboard/profile");
        return response.data;
    },
};

export default AuthService;
