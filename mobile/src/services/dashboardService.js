import api from './api';

export const DashboardService = {
    // 🔹 Get current user's dashboard profile data
    getProfile: async () => {
        const response = await api.get("/api/dashboard/profile");
        return response.data;
    },

    // 🔹 Create Referral Lead
    createReferralLead: async (payload) => {
        const response = await api.post("/api/dashboard/create-referral-lead", payload);
        return response.data;
    },

    // 🔹 Get Leads  
    getLeads: async () => {
        const response = await api.get("/api/dashboard/get-leads");
        return response.data;
    },

    // 🔹 Get Detailed Leads (Placeholder for now as per web service)
    getMyLeads: async () => {
        const response = await api.get("/api/dashboard/get-my-detail-leads");
        return response.data;
    },

    // 🔹 Get All Client Details (New API)
    getAllClientDetails: async () => {
        const response = await api.get("/api/dashboard/all-client-detail");
        return response.data;
    },

    // 🔹 Create Detailed Lead
    createLead: async (payload) => {
        const response = await api.post("/api/dashboard/create-detail-lead", payload);
        return response.data;
    },

    // 🔹 Get Lead Documents
    getLeadDocuments: async (leadId) => {
        const response = await api.get(`/api/dashboard/detail-lead/${leadId}/all-documents`);
        return response.data;
    },

    // 🔹 Upload Lead Document
    uploadLeadDocument: async (leadId, formData) => {
        const encodedId = encodeURIComponent(leadId);
        const response = await api.post(`/api/dashboard/detail-leads/${encodedId}/documents`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
